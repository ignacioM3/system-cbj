import { AppError } from "./AppError.js";

export class ServerError extends AppError {
  constructor() {
    super("Error en el servidor", "SERVER_ERROR", 500);
  }
}