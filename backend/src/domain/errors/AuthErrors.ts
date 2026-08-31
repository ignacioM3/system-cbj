import { AppError } from "./AppError.js";

export class CredentialsError extends AppError {
  constructor() {
    super("Credenciales Invalidas", "INVALID_CREDENTIALS", 404);
  }
}

export class InvalidPasswordError extends AppError {
  constructor() {
    super("Password Incorrecto", "INVALID_PASSWORD", 401);
  }
}

export class UserBlockedError extends AppError {
  constructor() {
    super("Usuario Bloqueado comunicarse con el administrador", "USER_BLOCKED", 403);
  }
}

export class EmailAlreadyExistsError extends AppError {
  constructor() {
    super("Ya existe un usuario registrado con este email", "EMAIL_ALREADY_EXISTS", 400);
  }
}