import { CreateUserUseCase } from "@domain/use-cases/users/CreateUser.js";
import type { DatabaseService } from "../services/DatabaseService.js";
import type { Request, Response } from "express";
import type { User } from "@domain";
import { UserRole } from "../database/schemas/UserRole.js";
import bcrypt from "bcrypt";

export class UserControllers {
  constructor(private db: DatabaseService) {}

  createUser = async (
    req: Request<any, any, Omit<User, "id" | "isActive" | "role">>,
    res: Response,
  ) => {
    const useCase = new CreateUserUseCase(this.db);


      const salt = await bcrypt.genSalt(10);
      const passwordSaled = await bcrypt.hash(req.body.password, salt);
      const userHashed = {
        ...req.body,
        password: passwordSaled
      }

    const newUser = await useCase.execute({
      newUser: userHashed,
      role: UserRole.COORDINATOR,
    });

    return res.status(201).json(newUser);
  };
}