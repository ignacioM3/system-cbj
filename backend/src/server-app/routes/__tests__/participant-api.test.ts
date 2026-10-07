import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Participant } from "../../../domain/entities/Participant.js";
import participantRoutes from "../participant-api.js";
import { ServiceContainer } from "../../services/ServicesContainer.js";

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
