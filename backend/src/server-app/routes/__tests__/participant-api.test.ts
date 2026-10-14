import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Participant } from "../../../domain/entities/Participant.js";
import participantRoutes from "../participant-api.js";
import { ServiceContainer } from "../../services/ServicesContainer.js";
import {
  ParticipantNotFoundError,
  ParticipantStatusConflictError,
} from "../../../domain/errors/ParticipantErrors.js";

const JWT_SECRET = "participant-route-test-secret";

const participant: Participant = {
  id: "participant-1",
  firstName: "Ana",
  lastName: "Pérez",
  documentNumber: "12345678",
  birthDate: new Date("2000-01-01"),
  email: "ana@example.com",
  phone: "+54 11 1234-5678",
  locationId: "location-1",
  isActive: true,
  created_at: new Date("2026-01-01"),
};

const userForRole = (role: "Admin" | "Coordinator" | "Equipment" | "Tutor") => ({
  id: `user-${role}`,
  firstName: "Test",
  lastName: "User",
  email: `${role.toLowerCase()}@example.com`,
  documentNumber: `document-${role}`,
  role,
  isActive: true,
  created_at: new Date(),
});

describe("PUT /api/participant/edit/:participantId", () => {
  const app = express();
  app.use(express.json());
  app.use("/api/participant", participantRoutes);

  let db: {
    getUserForAuth: ReturnType<typeof vi.fn>;
    getParticipantById: ReturnType<typeof vi.fn>;
    getParticipantByDocumentNumberAndLocationId: ReturnType<typeof vi.fn>;
    getParticipantByEmailAndLocationId: ReturnType<typeof vi.fn>;
    updateParticipant: ReturnType<typeof vi.fn>;
  };

  const tokenFor = (role: "Admin" | "Coordinator" | "Equipment" | "Tutor") =>
    jwt.sign({ id: `user-${role}` }, JWT_SECRET);

  const put = (body: Record<string, unknown>, role: "Admin" | "Coordinator" | "Equipment" | "Tutor" = "Admin") =>
    request(app)
      .put("/api/participant/edit/participant-1")
      .set("Authorization", `Bearer ${tokenFor(role)}`)
      .send(body);

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    db = {
      getUserForAuth: vi.fn(async (id: string) => {
        const role = id.replace("user-", "") as "Admin" | "Coordinator" | "Equipment" | "Tutor";
        return userForRole(role);
      }),
      getParticipantById: vi.fn(async () => participant),
      getParticipantByDocumentNumberAndLocationId: vi.fn(async () => null),
      getParticipantByEmailAndLocationId: vi.fn(async () => null),
      updateParticipant: vi.fn(async (_id: string, updateData: Partial<Participant>) => ({
        ...participant,
        ...updateData,
      })),
    };

    vi.spyOn(ServiceContainer, "getInstance").mockReturnValue({
      getDatabaseService: () => db,
    } as unknown as ServiceContainer);
  });

  it.each(["Admin", "Coordinator", "Equipment"] as const)(
    "permite editar a un usuario %s",
    async (role) => {
      const response = await put({ firstName: "  María  " }, role);

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe("María");
      expect(db.updateParticipant).toHaveBeenCalledWith("participant-1", { firstName: "María" });
    },
  );

  it("responde 401 cuando falta autenticación", async () => {
    const response = await request(app)
      .put("/api/participant/edit/participant-1")
      .send({ firstName: "María" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "No autorizado" });
  });

  it("responde 403 para Tutor", async () => {
    const response = await put({ firstName: "María" }, "Tutor");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "No autorizado" });
  });

  it("responde 404 si el participante no existe", async () => {
    db.getParticipantById.mockResolvedValueOnce(null);

    const response = await put({ firstName: "María" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Participante no encontrado" });
  });

  it("responde 400 si el participante está inactivo", async () => {
    db.getParticipantById.mockResolvedValueOnce({ ...participant, isActive: false });

    const response = await put({ firstName: "María" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Participante Inactivo" });
  });

  it("responde 400 si el documento ya existe en la sede", async () => {
    db.getParticipantByDocumentNumberAndLocationId.mockResolvedValueOnce({
      ...participant,
      id: "participant-2",
    });

    const response = await put({ documentNumber: "87654321" });

    expect(response.status).toBe(400);
  });

  it("responde 400 si el email ya existe en la sede", async () => {
    db.getParticipantByEmailAndLocationId.mockResolvedValueOnce({
      ...participant,
      id: "participant-2",
    });

    const response = await put({ email: "OTHER@EXAMPLE.COM" });

    expect(response.status).toBe(400);
    expect(db.getParticipantByEmailAndLocationId).toHaveBeenCalledWith(
      "other@example.com",
      "location-1",
    );
  });

  it.each([
    [{ firstName: "" }, "nombre vacío"],
    [{ email: "invalid" }, "email inválido"],
    [{ birthDate: "not-a-date" }, "fecha inválida"],
    [{ phone: "abc" }, "teléfono inválido"],
  ])("responde 400 por %s (%s)", async (body, _description) => {
    const response = await put(body);

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(db.updateParticipant).not.toHaveBeenCalled();
  });

  it("responde 400 si el body contiene campos protegidos", async () => {
    const response = await put({ firstName: "María", locationId: "location-2" });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toContain("Campos no editables");
    expect(db.updateParticipant).not.toHaveBeenCalled();
  });

  it("responde 400 si no hay campos editables", async () => {
    const response = await put({ unknownField: "value" });

    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe("No hay campos a actualizar");
    expect(db.updateParticipant).not.toHaveBeenCalled();
  });
});

describe("POST /api/participant/toggle-status/:id", () => {
  const app = express();
  app.use(express.json());
  app.use("/api/participant", participantRoutes);

  const participantId = "11111111-1111-4111-8111-111111111111";
  const missingParticipantId = "22222222-2222-4222-8222-222222222222";

  let db: {
    getUserForAuth: ReturnType<typeof vi.fn>;
    getParticipantById: ReturnType<typeof vi.fn>;
    toggleParticipantStatusById: ReturnType<typeof vi.fn>;
  };

  const tokenFor = (role: "Admin" | "Coordinator" | "Equipment" | "Tutor") =>
    jwt.sign({ id: `user-${role}` }, JWT_SECRET);

  const post = (
    id: string,
    role?: "Admin" | "Coordinator" | "Equipment" | "Tutor",
    body?: Record<string, unknown>,
  ) => {
    let testRequest = request(app).post(`/api/participant/toggle-status/${id}`);

    if (role) {
      testRequest = testRequest.set("Authorization", `Bearer ${tokenFor(role)}`);
    }

    return body === undefined ? testRequest : testRequest.send(body);
  };

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    db = {
      getUserForAuth: vi.fn(async (id: string) => {
        const role = id.replace("user-", "") as
          | "Admin"
          | "Coordinator"
          | "Equipment"
          | "Tutor";
        return userForRole(role);
      }),
      getParticipantById: vi.fn(async () => ({ ...participant, id: participantId })),
      toggleParticipantStatusById: vi.fn(async (id: string) => id),
    };

    vi.spyOn(ServiceContainer, "getInstance").mockReturnValue({
      getDatabaseService: () => db,
    } as unknown as ServiceContainer);
  });

  it.each([
    ["con token", "Admin"],
    ["sin token", undefined],
    ["con rol no autorizado", "Tutor"],
  ] as const)("responde 404 para UUID malformado %s antes de existencia y auth", async (_case, role) => {
    const response = await post("not-a-uuid", role);

    expect(response.status).toBe(404);
    expect(db.getParticipantById).not.toHaveBeenCalled();
    expect(db.getUserForAuth).not.toHaveBeenCalled();
    expect(db.toggleParticipantStatusById).not.toHaveBeenCalled();
  });

  it.each([
    ["con token", "Admin"],
    ["sin token", undefined],
    ["con rol no autorizado", "Tutor"],
  ] as const)("responde 404 para participante inexistente %s antes de auth", async (_case, role) => {
    db.getParticipantById.mockResolvedValue(null);

    const response = await post(missingParticipantId, role);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Participante no encontrado" });
    expect(db.getParticipantById).toHaveBeenCalledWith(missingParticipantId);
    expect(db.getUserForAuth).not.toHaveBeenCalled();
    expect(db.toggleParticipantStatusById).not.toHaveBeenCalled();
  });

  it("responde 401 sin autenticación cuando el participante existe", async () => {
    const response = await post(participantId);

    expect(response.status).toBe(401);
    expect(db.getParticipantById).toHaveBeenCalledWith(participantId);
    expect(db.toggleParticipantStatusById).not.toHaveBeenCalled();
  });

  it("responde 403 para Tutor cuando el participante existe", async () => {
    const response = await post(participantId, "Tutor");

    expect(response.status).toBe(403);
    expect(db.getParticipantById).toHaveBeenCalledWith(participantId);
    expect(db.getUserForAuth).toHaveBeenCalledOnce();
    expect(db.toggleParticipantStatusById).not.toHaveBeenCalled();
  });

  it.each(["Admin", "Coordinator", "Equipment"] as const)(
    "permite alternar a un usuario %s",
    async (role) => {
      const response = await post(participantId, role);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ participantId });
      expect(db.toggleParticipantStatusById).toHaveBeenCalledOnce();
      expect(db.toggleParticipantStatusById).toHaveBeenCalledWith(participantId);
    },
  );

  it.each([
    ["ausente", undefined],
    ["vacío", {}],
    ["arbitrario", { arbitrary: "value" }],
    ["isActive true", { isActive: true }],
    ["isActive false", { isActive: false }],
  ] as const)("ignora el body %s y entrega únicamente el ID", async (_case, body) => {
    const response = await post(participantId, "Admin", body);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ participantId });
    expect(db.toggleParticipantStatusById).toHaveBeenCalledWith(participantId);
  });

  it("responde 404 ante inexistencia detectada al alternar", async () => {
    db.toggleParticipantStatusById.mockRejectedValueOnce(
      new ParticipantNotFoundError(),
    );

    const response = await post(participantId, "Admin");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Participante no encontrado" });
  });

  it("responde 409 ante conflicto de concurrencia", async () => {
    const error = new ParticipantStatusConflictError();
    db.toggleParticipantStatusById.mockRejectedValueOnce(error);

    const response = await post(participantId, "Admin");

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: error.message });
  });
});
