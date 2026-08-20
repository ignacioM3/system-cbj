import { AppError } from "./AppError.js";

export class UserNotFoundError extends AppError {
  constructor() {
    super("Usuario no encontrado", "USER_NOT_FOUND", 404);
  }
}

export class RequiredIDError extends AppError {
  constructor(){
    super("El ID es obligatorio", "REQUIRED_ID", 400);
  }
}