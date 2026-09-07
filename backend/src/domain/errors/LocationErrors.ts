import { AppError } from "./AppError.js";

export class LocationNotFoundError extends AppError {
  constructor() {
    super("Sede no encontrada", "USER_NOT_FOUND", 404);
  }
}

