import type { Request, Response, NextFunction } from "express";
import { UserRole } from "../../domain/entities/User-Role.js";

export const authorize = (...allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {

        if (!req.user) {
            return res.status(401).json({ error: "No autenticado" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "No autorizado" });
        }

        next();
    };
};
