import { CreateUserUseCase } from "@domain/use-cases/users/CreateUser.js";
import type { DatabaseService } from "../services/DatabaseService.js";
import type { Request, Response } from "express";
import { type User } from "@domain";
import { UserRole } from "../database/schemas/UserRole.js";
import bcrypt from "bcrypt";
import { GetUsersByRoleUseCase } from "@domain/use-cases/users/GetUserByRolePaginated.js";
import { DisableUserUseCase } from "@domain/use-cases/users/DisableUserCase.js";
import { DeleteUserUseCase } from "@domain/use-cases/users/DeleteUserCase.js";

export class UserControllers {
  constructor(private db: DatabaseService) {}

  createUserCoordinator = async (
    req: Request<any, any, Omit<User, "id" | "isActive" | "role">>,
    res: Response,
  ) => {
    const useCase = new CreateUserUseCase(this.db);

    const salt = await bcrypt.genSalt(10);
    const passwordSaled = await bcrypt.hash(req.body.password, salt);
    const userHashed = {
      ...req.body,
      password: passwordSaled,
    };

    const newUser = await useCase.execute({
      newUser: userHashed,
      role: UserRole.COORDINATOR,
    });

    return res.status(201).json(newUser);
  };

  getUserCoordinator = async (req: Request, res: Response) => {
    const useCase = new GetUsersByRoleUseCase(this.db);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;

    const result = await useCase.execute({
      role: UserRole.COORDINATOR,
      page,
      limit,
    });

    return res.status(200).json(result);
  };

  disableUser = async (req: Request<{userId: string}>, res: Response) => {
    const {userId} = req.params

     const useCase = new DisableUserUseCase(this.db);

        await useCase.execute({ userId });

        res.send("Usuario deshabilitado con exito")
  }

  deleteUser = async(req: Request<{userId: string}>, res: Response) =>{
    const {userId} = req.params;

    const useCase = new DeleteUserUseCase(this.db);

    await useCase.execute({userId})

    res.send('Usuario eliminado con exito')
  }
}
