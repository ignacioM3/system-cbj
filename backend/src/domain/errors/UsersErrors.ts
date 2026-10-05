import { AppError } from "./AppError.js";

export class UserNotFoundError extends AppError {
  constructor() {
    super("Usuario no encontrado", "USER_NOT_FOUND", 404);
  }
}

export class DocumentNumberAlreadyExistsError extends AppError {
  constructor() {
    super("Usuario ya registrado con este DNI", "DOCUMENT_NUMBER_ALREADY_EXISTS", 400);
  }
}