import { describe, it, expect, vi, beforeEach } from "vitest";
import { DatabaseService } from "../DatabaseService.js";
import { ParticipantNotFoundError } from "@domain";
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
  let db: DatabaseService;

  beforeEach(() => {
    participantRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      merge: vi.fn((a: unknown, b: unknown) => ({ ...a as object, ...b as object })),
      save: vi.fn(async (p: unknown) => p),
    };
    const dataSource = {
      getRepository: vi.fn(() => participantRepo),
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
});
