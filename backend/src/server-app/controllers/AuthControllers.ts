import type { DatabaseService } from "../services/DatabaseService.js";
import type { Request, Response } from "express";
import { generateJWT } from "../utils/jwt.js";
import bcrypt from "bcrypt";
import {
  CredentialsError,
  ServerError,
  UserBlockedError,
} from "@domain";

export class AuthControllers {
  constructor(private db: DatabaseService) {}
  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await this.db.getUserByEmail(email);
      if (!user) {
        const error = new CredentialsError();
        return res.status(error.statusCode).json({ error: error.message });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        const error = new CredentialsError();
        return res.status(error.statusCode).json({ error: error.message });
      }
      if (!user?.isActive) {
        const error = new UserBlockedError();
        return res.status(error.statusCode).json({ error: error.message });
      }
      const token = generateJWT({ id: user.id });
      res.send(token);
    } catch (error) {
      const serverError = new ServerError();
      res.status(serverError.statusCode).json({ error: serverError.message });
    }
  };

  perfil = async (req: Request, res: Response) => {
    return res.json(req.user);
  };
}
