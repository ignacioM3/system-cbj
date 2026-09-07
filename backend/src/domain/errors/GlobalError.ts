import { AppError } from "./AppError.js";

export class ServerError extends AppError {
  constructor() {
    super("Error en el servidor", "SERVER_ERROR", 500);
  }
}



export class RequiredIDError extends AppError {
  constructor(){
    super("El ID es obligatorio", "REQUIRED_ID", 400);
  }
}
