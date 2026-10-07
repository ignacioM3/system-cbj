import { describe, it, expect } from "vitest";
import {
  ParticipantNotFoundError,
  ParticipantInactiveError,
} from "../ParticipantErrors.js";
import { AppError } from "../AppError.js";

describe("ParticipantNotFoundError", () => {
  it("es instanciable y extiende AppError", () => {
    const error = new ParticipantNotFoundError();
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
  });

  it("tiene message, code y statusCode correctos", () => {
    const error = new ParticipantNotFoundError();
    expect(error.code).toBe("PARTICIPANT_NOT_FOUND");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBeTruthy();
  });
});

describe("ParticipantInactiveError", () => {
  it("es instanciable y extiende AppError", () => {
    const error = new ParticipantInactiveError();
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
  });

  it("tiene message, code y statusCode correctos", () => {
    const error = new ParticipantInactiveError();
    expect(error.code).toBe("PARTICIPANT_INACTIVE");
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Participante Inactivo");
  });
});
