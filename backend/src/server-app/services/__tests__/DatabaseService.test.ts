import { describe, it, expect, vi, beforeEach } from "vitest";
import { DatabaseService } from "../DatabaseService.js";
import {
  ParticipantNotFoundError,
  ParticipantStatusConflictError,
} from "@domain";
import type { Participant } from "@domain";

const baseParticipant: Participant = {
  id: "uuid-1",
  firstName: "Ana",
  lastName: "Perez",
  documentNumber: "123",
  birthDate: null,
  email: "ana@test.com",
  phone: null,
  isActive: true,
  locationId: "loc-1",
  created_at: new Date(),
} as unknown as Participant;

describe("DatabaseService - participantes (T3)", () => {
  let participantRepo: {
    findOne: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    merge: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let transactionalParticipantRepo: {
    findOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let transaction: ReturnType<typeof vi.fn>;
  let db: DatabaseService;

  beforeEach(() => {
    participantRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      merge: vi.fn((a: unknown, b: unknown) => ({ ...a as object, ...b as object })),
      save: vi.fn(async (p: unknown) => p),
    };
    transactionalParticipantRepo = {
      findOne: vi.fn(),
      save: vi.fn(async (participant: Participant) => participant),
    };
    transaction = vi.fn(async (operation: (manager: { getRepository: ReturnType<typeof vi.fn> }) => Promise<unknown>) =>
      operation({ getRepository: vi.fn(() => transactionalParticipantRepo) }),
    );
    const dataSource = {
      getRepository: vi.fn(() => participantRepo),
      transaction,
    };
    db = new DatabaseService(dataSource as never);
  });

  it("getParticipantById devuelve el participante", async () => {
    participantRepo.findOne.mockResolvedValue(baseParticipant);
    const result = await db.getParticipantById("uuid-1");
    expect(participantRepo.findOne).toHaveBeenCalledWith({ where: { id: "uuid-1" } });
    expect(result).toEqual(baseParticipant);
  });

  it("getParticipantById devuelve null si no existe", async () => {
    participantRepo.findOne.mockResolvedValue(null);
    const result = await db.getParticipantById("uuid-x");
    expect(result).toBeNull();
  });

  it("getParticipantByEmailAndLocationId filtra por email y locationId", async () => {
    participantRepo.findOne.mockResolvedValue(baseParticipant);
    const result = await db.getParticipantByEmailAndLocationId("ana@test.com", "loc-1");
    expect(participantRepo.findOne).toHaveBeenCalledWith({
      where: { email: "ana@test.com", locationId: "loc-1" },
    });
    expect(result).toEqual(baseParticipant);
  });

  it("updateParticipant hace merge + save y devuelve el actualizado", async () => {
    participantRepo.findOne.mockResolvedValue({ ...baseParticipant });
    const result = await db.updateParticipant("uuid-1", { firstName: "Maria" });
    expect(participantRepo.merge).toHaveBeenCalled();
    expect(participantRepo.save).toHaveBeenCalled();
    expect(result.firstName).toBe("Maria");
  });

  it("updateParticipant lanza ParticipantNotFoundError si no existe", async () => {
    participantRepo.findOne.mockResolvedValue(null);
    await expect(db.updateParticipant("uuid-x", { firstName: "Maria" })).rejects.toBeInstanceOf(
      ParticipantNotFoundError,
    );
  });

  it("alterna un participante activo a inactivo dentro de una transacción", async () => {
    transactionalParticipantRepo.findOne.mockResolvedValue({ ...baseParticipant });

    const result = await db.toggleParticipantStatusById(baseParticipant.id);

    expect(transaction).toHaveBeenCalledOnce();
    expect(transactionalParticipantRepo.findOne).toHaveBeenCalledWith({
      where: { id: baseParticipant.id },
      lock: { mode: "pessimistic_write", onLocked: "nowait" },
    });
    expect(transactionalParticipantRepo.save).toHaveBeenCalledWith({
      ...baseParticipant,
      isActive: false,
    });
    expect(participantRepo.findOne).not.toHaveBeenCalled();
    expect(participantRepo.save).not.toHaveBeenCalled();
    expect(result).toBe(baseParticipant.id);
  });

  it("alterna un participante inactivo a activo sin modificar otros campos", async () => {
    const inactiveParticipant = { ...baseParticipant, isActive: false };
    transactionalParticipantRepo.findOne.mockResolvedValue(inactiveParticipant);

    const result = await db.toggleParticipantStatusById(baseParticipant.id);

    expect(transactionalParticipantRepo.save).toHaveBeenCalledWith({
      ...inactiveParticipant,
      isActive: true,
    });
    expect(result).toBe(baseParticipant.id);
  });

  it("lanza ParticipantNotFoundError bajo lock sin guardar si no existe", async () => {
    transactionalParticipantRepo.findOne.mockResolvedValue(null);

    await expect(db.toggleParticipantStatusById("missing-id")).rejects.toBeInstanceOf(
      ParticipantNotFoundError,
    );

    expect(transactionalParticipantRepo.findOne).toHaveBeenCalledWith({
      where: { id: "missing-id" },
      lock: { mode: "pessimistic_write", onLocked: "nowait" },
    });
    expect(transactionalParticipantRepo.save).not.toHaveBeenCalled();
  });

  it("traduce SQLSTATE 55P03 a ParticipantStatusConflictError sin guardar", async () => {
    transactionalParticipantRepo.findOne.mockRejectedValue({ code: "55P03" });

    await expect(db.toggleParticipantStatusById(baseParticipant.id)).rejects.toBeInstanceOf(
      ParticipantStatusConflictError,
    );

    expect(transactionalParticipantRepo.save).not.toHaveBeenCalled();
  });

  it("ante dos invocaciones solapadas solo una alterna y la otra recibe conflicto", async () => {
    let lockHeld = false;
    let releaseFirst: (() => void) | undefined;
    const firstMayContinue = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });

    transactionalParticipantRepo.findOne.mockImplementation(async () => {
      if (lockHeld) {
        releaseFirst?.();
        throw { code: "55P03" };
      }

      lockHeld = true;
      await firstMayContinue;
      return { ...baseParticipant };
    });

    const results = await Promise.allSettled([
      db.toggleParticipantStatusById(baseParticipant.id),
      db.toggleParticipantStatusById(baseParticipant.id),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find((result) => result.status === "rejected");
    expect(rejected).toMatchObject({
      status: "rejected",
      reason: expect.any(ParticipantStatusConflictError),
    });
    expect(transactionalParticipantRepo.save).toHaveBeenCalledOnce();
    expect(transactionalParticipantRepo.save).toHaveBeenCalledWith({
      ...baseParticipant,
      isActive: false,
    });
  });
});
