import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ServiceContainer } from "../services/ServicesContainer.js";
import type { User } from "@domain";

declare global{
    namespace Express{
        interface Request{
            user: Omit<User, "password">;
        }
    }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bearer = req.headers.authorization;

    if (!bearer) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const token = bearer.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token inválido" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string };

    // obtener db desde tus servicios
    const db = ServiceContainer.getInstance().getDatabaseService();

    // buscar usuario
    const user = await db.getUserForAuth(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Token inválido" });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: "Usuario bloqueado" });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Token no válido" });
  }
};
