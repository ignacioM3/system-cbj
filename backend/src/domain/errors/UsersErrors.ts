import { AppError } from "./AppError.js";

export class UserNotFoundError extends AppError {
  constructor() {
    super("Usuario no encontrado", "USER_NOT_FOUND", 404);
  }
}
