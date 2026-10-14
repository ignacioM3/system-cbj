import { describe, it, expect, vi, beforeEach } from "vitest";
import { ParticipantControllers } from "../ParticipantControllers.js";
import type { DatabaseService } from "../../services/DatabaseService.js";
import type { Participant } from "../../../domain/entities/Participant.js";
import {
  ParticipantNotFoundError,
  ParticipantStatusConflictError,
} from "../../../domain/errors/ParticipantErrors.js";

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

function makeDb(
  overrides: Partial<Record<string, ReturnType<typeof vi.fn>>> = {},
): DatabaseService {
  return {
    getParticipantById: vi.fn().mockResolvedValue({ ...baseParticipant }),
    getParticipantByEmailAndLocationId: vi.fn().mockResolvedValue(null),
    getParticipantByDocumentNumberAndLocationId: vi.fn().mockResolvedValue(null),
    updateParticipant: vi.fn(
      async (_id: string, data: unknown) =>
        ({ ...baseParticipant, ...(data as object) }),
    ),
    toggleParticipantStatusById: vi.fn(async (participantId: string) => participantId),
    ...overrides,
  } as unknown as DatabaseService;
}

function makeRes() {
  const res = {
    status: vi.fn(() => res),
    json: vi.fn(() => res),
  };
  return res;
}

describe("ParticipantControllers.editParticipant (T5)", () => {
  let db: DatabaseService;
  let controller: ParticipantControllers;

  beforeEach(() => {
    db = makeDb();
    controller = new ParticipantControllers(db);
  });

  it("responde 200 con el participante actualizado", async () => {
    const req = { params: { participantId: "uuid-1" }, body: { firstName: "Maria" } };
    const res = makeRes();

    await controller.editParticipant(req as never, res as never);

    expect(db.updateParticipant).toHaveBeenCalledWith("uuid-1", { firstName: "Maria" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ...baseParticipant, firstName: "Maria" });
  });

  it("toma participantId de req.params y el body como datos de edición", async () => {
    const req = { params: { participantId: "uuid-42" }, body: { lastName: "Gomez" } };
    const res = makeRes();

    await controller.editParticipant(req as never, res as never);

    expect(db.getParticipantById).toHaveBeenCalledWith("uuid-42");
    expect(db.updateParticipant).toHaveBeenCalledWith("uuid-42", { lastName: "Gomez" });
  });

  it("responde 404 cuando el participante no existe", async () => {
    db = makeDb({ getParticipantById: vi.fn().mockResolvedValue(null) });
    controller = new ParticipantControllers(db);
    const req = { params: { participantId: "uuid-x" }, body: { firstName: "Maria" } };
    const res = makeRes();

    await controller.editParticipant(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Participante no encontrado" });
    expect(db.updateParticipant).not.toHaveBeenCalled();
  });

  it("responde 400 con 'Participante Inactivo' cuando está inactivo", async () => {
    db = makeDb({
      getParticipantById: vi.fn().mockResolvedValue({ ...baseParticipant, isActive: false }),
    });
    controller = new ParticipantControllers(db);
    const req = { params: { participantId: "uuid-1" }, body: { firstName: "Maria" } };
    const res = makeRes();

    await controller.editParticipant(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Participante Inactivo" });
    expect(db.updateParticipant).not.toHaveBeenCalled();
  });

  it("responde 400 ante documento duplicado en la misma sede", async () => {
    db = makeDb({
      getParticipantByDocumentNumberAndLocationId: vi
        .fn()
        .mockResolvedValue({ ...baseParticipant, id: "otro", documentNumber: "999" }),
    });
    controller = new ParticipantControllers(db);
    const req = { params: { participantId: "uuid-1" }, body: { documentNumber: "999" } };
    const res = makeRes();

    await controller.editParticipant(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(db.updateParticipant).not.toHaveBeenCalled();
  });

  it("responde 400 ante email duplicado en la misma sede", async () => {
    db = makeDb({
      getParticipantByEmailAndLocationId: vi
        .fn()
        .mockResolvedValue({ ...baseParticipant, id: "otro", email: "otro@test.com" }),
    });
    controller = new ParticipantControllers(db);
    const req = { params: { participantId: "uuid-1" }, body: { email: "otro@test.com" } };
    const res = makeRes();

    await controller.editParticipant(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(db.updateParticipant).not.toHaveBeenCalled();
  });

  it("responde 400 ante datos inválidos", async () => {
    const req = { params: { participantId: "uuid-1" }, body: { firstName: "   " } };
    const res = makeRes();

    await controller.editParticipant(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(db.updateParticipant).not.toHaveBeenCalled();
  });

  it("delega la lógica de negocio en el use case (normalización de email)", async () => {
    const req = { params: { participantId: "uuid-1" }, body: { email: "  Maria@Test.COM  " } };
    const res = makeRes();

    await controller.editParticipant(req as never, res as never);

    expect(db.getParticipantByEmailAndLocationId).toHaveBeenCalledWith(
      "maria@test.com",
      "loc-1",
    );
    expect(db.updateParticipant).toHaveBeenCalledWith("uuid-1", { email: "maria@test.com" });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("ParticipantControllers - alternancia de estado", () => {
  it("el handler previo continúa sin responder ni adjuntar datos cuando existe", async () => {
    const db = makeDb();
    const controller = new ParticipantControllers(db);
    const req = { params: { id: "uuid-1" }, body: { isActive: false } };
    const res = makeRes();
    const next = vi.fn();

    expect(db.getParticipantById).toHaveBeenCalledOnce();
    expect(db.getParticipantById).toHaveBeenCalledWith("uuid-1");
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(req).toEqual({ params: { id: "uuid-1" }, body: { isActive: false } });
    expect(db.toggleParticipantStatusById).not.toHaveBeenCalled();
  });


  it("el handler principal ignora el body, entrega solo params.id y responde 200 exacto", async () => {
    const db = makeDb();
    const controller = new ParticipantControllers(db);
    const req = {
      params: { id: "uuid-1" },
      body: { isActive: true, arbitrary: "ignored" },
    };
    const res = makeRes();

    await controller.toggleParticipantStatus(req as never, res as never);

    expect(db.toggleParticipantStatusById).toHaveBeenCalledOnce();
    expect(db.toggleParticipantStatusById).toHaveBeenCalledWith("uuid-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ participantId: "uuid-1" });
  });

  it("el handler principal adapta una inexistencia tardía a 404", async () => {
    const db = makeDb({
      toggleParticipantStatusById: vi
        .fn()
        .mockRejectedValue(new ParticipantNotFoundError()),
    });
    const controller = new ParticipantControllers(db);
    const res = makeRes();

    await controller.toggleParticipantStatus(
      { params: { id: "missing-id" }, body: {} } as never,
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Participante no encontrado" });
  });

  it("el handler principal adapta el conflicto de concurrencia a 409", async () => {
    const error = new ParticipantStatusConflictError();
    const db = makeDb({
      toggleParticipantStatusById: vi.fn().mockRejectedValue(error),
    });
    const controller = new ParticipantControllers(db);
    const res = makeRes();

    await controller.toggleParticipantStatus(
      { params: { id: "uuid-1" }, body: { isActive: false } } as never,
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: error.message });
  });
});
