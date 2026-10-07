import { AppError } from "./AppError.js";

export class ParticipantNotFoundError extends AppError {
  constructor() {
    super("Participante no encontrado", "PARTICIPANT_NOT_FOUND", 404);
  }
}

export class ParticipantInactiveError extends AppError {
  constructor() {
    super("Participante Inactivo", "PARTICIPANT_INACTIVE", 400);
  }
}

export class NoFieldsToUpdateError extends AppError {
  constructor() {
    super("No hay campos a actualizar", "NO_FIELDS_TO_UPDATE", 400);
  }
}

export class ProtectedFieldsError extends AppError {
  constructor(fields: string[]) {
    super(`Campos no modificables: ${fields.join(", ")}`, "PROTECTED_FIELDS", 400);
  }
}

export class InvalidParticipantDataError extends AppError {
  constructor(message: string) {
    super(message, "INVALID_PARTICIPANT_DATA", 400);
  }
}
