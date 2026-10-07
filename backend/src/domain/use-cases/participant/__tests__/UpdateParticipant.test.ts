import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateParticipantUseCase } from "../UpdateParticipant.js";
import {
  ParticipantNotFoundError,
  ParticipantInactiveError,
  DocumentNumberAlreadyExistsError,
  EmailAlreadyExistsError,
} from "@domain";
import type { IDatabaseService } from "@domain";
import type { Participant } from "@domain";

const baseParticipant: Participant = {
  id: "uuid-1",
  firstName: "Ana",
  lastName: "Perez",
  documentNumber: "123",
  birthDate: new Date("1990-01-01"),
  email: "ana@test.com",
  phone: "123456",
  isActive: true,
  locationId: "loc-1",
  created_at: new Date(),
} as Participant;

function makeDb(overrides: Partial<Record<string, ReturnType<typeof vi.fn>>> = {}): IDatabaseService {
  return {
    getParticipantById: vi.fn().mockResolvedValue({ ...baseParticipant }),
    getParticipantByEmailAndLocationId: vi.fn().mockResolvedValue(null),
    getParticipantByDocumentNumberAndLocationId: vi.fn().mockResolvedValue(null),
    updateParticipant: vi.fn(async (_id: string, data: unknown) => ({ ...baseParticipant, ...(data as object) })),
    ...overrides,
  } as unknown as IDatabaseService;
}

describe("UpdateParticipantUseCase", () => {
  let db: IDatabaseService;
  let useCase: UpdateParticipantUseCase;

  beforeEach(() => {
    db = makeDb();
    useCase = new UpdateParticipantUseCase(db);
  });

  it("actualiza parcialmente solo los campos enviados", async () => {
    const result = await useCase.execute("uuid-1", { updateData: { firstName: "Maria" } });
    expect(db.updateParticipant).toHaveBeenCalledWith("uuid-1", { firstName: "Maria" });
    expect(result.updatedParticipant.firstName).toBe("Maria");
  });

  it("exige participantId", async () => {
    await expect(useCase.execute("", { updateData: { firstName: "X" } })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("lanza ParticipantNotFoundError si no existe", async () => {
    db = makeDb({ getParticipantById: vi.fn().mockResolvedValue(null) });
    useCase = new UpdateParticipantUseCase(db);
    await expect(useCase.execute("uuid-x", { updateData: { firstName: "Maria" } })).rejects.toBeInstanceOf(
      ParticipantNotFoundError,
    );
    expect(db.updateParticipant).not.toHaveBeenCalled();
  });

  it("lanza ParticipantInactiveError si está inactivo", async () => {
    db = makeDb({ getParticipantById: vi.fn().mockResolvedValue({ ...baseParticipant, isActive: false }) });
    useCase = new UpdateParticipantUseCase(db);
    await expect(useCase.execute("uuid-1", { updateData: { firstName: "Maria" } })).rejects.toBeInstanceOf(
      ParticipantInactiveError,
    );
    expect(db.updateParticipant).not.toHaveBeenCalled();
  });

  it("rechaza documento duplicado en la misma sede", async () => {
    db = makeDb({
      getParticipantByDocumentNumberAndLocationId: vi
        .fn()
        .mockResolvedValue({ ...baseParticipant, id: "otro", documentNumber: "999" }),
    });
    useCase = new UpdateParticipantUseCase(db);
    await expect(useCase.execute("uuid-1", { updateData: { documentNumber: "999" } })).rejects.toBeInstanceOf(
      DocumentNumberAlreadyExistsError,
    );
    expect(db.updateParticipant).not.toHaveBeenCalled();
  });

  it("permite el mismo documento del propio participante", async () => {
    db = makeDb({
      getParticipantByDocumentNumberAndLocationId: vi.fn().mockResolvedValue({ ...baseParticipant }),
    });
    useCase = new UpdateParticipantUseCase(db);
    const result = await useCase.execute("uuid-1", { updateData: { documentNumber: "123" } });
    expect(result.updatedParticipant.documentNumber).toBe("123");
  });

  it("rechaza email duplicado en la misma sede", async () => {
    db = makeDb({
      getParticipantByEmailAndLocationId: vi
        .fn()
        .mockResolvedValue({ ...baseParticipant, id: "otro", email: "otro@test.com" }),
    });
    useCase = new UpdateParticipantUseCase(db);
    await expect(useCase.execute("uuid-1", { updateData: { email: "otro@test.com" } })).rejects.toBeInstanceOf(
      EmailAlreadyExistsError,
    );
  });

  it("normaliza el email (trim + minúsculas) antes de validar, verificar y persistir", async () => {
    const result = await useCase.execute("uuid-1", { updateData: { email: "  Nuevo@Test.COM " } });
    expect(db.getParticipantByEmailAndLocationId).toHaveBeenCalledWith("nuevo@test.com", "loc-1");
    expect(db.updateParticipant).toHaveBeenCalledWith("uuid-1", { email: "nuevo@test.com" });
    expect(result.updatedParticipant.email).toBe("nuevo@test.com");
  });

  it("limpia email/phone/birthDate con '' o null", async () => {
    await useCase.execute("uuid-1", { updateData: { email: "", phone: null, birthDate: "" } });
    expect(db.updateParticipant).toHaveBeenCalledWith("uuid-1", { email: null, phone: null, birthDate: null });
  });

  it("rechaza firstName/lastName/documentNumber vacíos o null con 400", async () => {
    await expect(useCase.execute("uuid-1", { updateData: { firstName: "  " } })).rejects.toMatchObject({
      statusCode: 400,
    });
    await expect(useCase.execute("uuid-1", { updateData: { lastName: null } })).rejects.toMatchObject({
      statusCode: 400,
    });
    await expect(useCase.execute("uuid-1", { updateData: { documentNumber: "" } })).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(db.updateParticipant).not.toHaveBeenCalled();
  });

  it("rechaza email con formato inválido", async () => {
    await expect(useCase.execute("uuid-1", { updateData: { email: "no-es-email" } })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rechaza phone con formato inválido", async () => {
    await expect(useCase.execute("uuid-1", { updateData: { phone: "12" } })).rejects.toMatchObject({
      statusCode: 400,
    });
    await expect(useCase.execute("uuid-1", { updateData: { phone: "abc123456" } })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("acepta phone válido", async () => {
    await useCase.execute("uuid-1", { updateData: { phone: "+54 11-5555-5555" } });
    expect(db.updateParticipant).toHaveBeenCalledWith("uuid-1", { phone: "+54 11-5555-5555" });
  });

  it("rechaza birthDate inválida", async () => {
    await expect(useCase.execute("uuid-1", { updateData: { birthDate: "no-fecha" } })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rechaza campos protegidos con 400", async () => {
    for (const protectedField of ["id", "created_at", "isActive", "locationId", "location", "role"]) {
      await expect(
        useCase.execute("uuid-1", { updateData: { firstName: "Maria", [protectedField]: "x" } as never }),
      ).rejects.toMatchObject({ statusCode: 400 });
    }
    expect(db.updateParticipant).not.toHaveBeenCalled();
  });

  it("rechaza una solicitud sin campos a modificar", async () => {
    await expect(useCase.execute("uuid-1", { updateData: {} })).rejects.toMatchObject({ statusCode: 400 });
    await expect(
      useCase.execute("uuid-1", { updateData: { firstName: undefined } as never }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
