import { GetAllParticipantByLocationUseCase } from "@domain/use-cases/participant/GetAllParticipantByLocationUseCase.js";
import type { DatabaseService } from "../services/DatabaseService.js";
import { CreateParticipantUseCase } from "@domain/use-cases/participant/CreateParticipant.js";
import { UpdateParticipantUseCase } from "@domain/use-cases/participant/UpdateParticipantUseCase.js";
import type { UpdateParticipantInput } from "@domain/use-cases/participant/UpdateParticipantUseCase.js";
import { DisableAndActiveParticipantUseCase } from "@domain/use-cases/participant/DisableAndActiveParticipantUseCase.js";
import { AppError } from "@domain/errors/AppError.js";
import type { NextFunction, Request, Response } from "express";
import { GetParticipantsPaginatedUseCase } from "@domain/use-cases/participant/GetParticipantsPaginatedUseCase.js";
import { GetParticipantByIdUseCase } from "@domain/use-cases/participant/GetParticipantByIdUseCase.js";

export class ParticipantControllers {
  constructor(private db: DatabaseService) {}

  async getParticipantsByLocationId(req: any, res: any) {
    const useCase = new GetAllParticipantByLocationUseCase(this.db);
    const { locationId } = req.params;

    const participants = await useCase.execute({ locationId });
    res.status(200).json(participants);
  }

async createParticipant(req: Request, res: Response) {
  const newUser = {
    ...req.body,
  };

  const useCase = new CreateParticipantUseCase(this.db);

  try {
    const result = await useCase.execute({ newUser });
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    throw error;
  }
}

  async editParticipant(
    req: Request<
      { participantId: string },
      any,
      UpdateParticipantInput["updateData"]
    >,
    res: Response,
  ) {
    const { participantId } = req.params;
    const useCase = new UpdateParticipantUseCase(this.db);

    try {
      const { updatedParticipant } = await useCase.execute(participantId, {
        updateData: req.body,
      });
      return res.status(200).json(updatedParticipant);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      throw error;
    }
  }


  async toggleParticipantStatus(req: Request<{ id: string }>, res: Response) {
    const useCase = new DisableAndActiveParticipantUseCase(this.db);

    try {
      const result = await useCase.execute(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      throw error;
    }
  }

  async getParticipantsPaginated(req: Request, res: Response) {
    const useCase = new GetParticipantsPaginatedUseCase(this.db);
    const { locationId } = req.params as { locationId: string };
    const { isActive } = req.query;
    const isActiveBoolean = isActive === "false" ? false : true;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;

    const result = await useCase.execute({
      page,
      limit,
      locationId,
      isActive: isActiveBoolean,
    });

    return res.status(200).json(result);
  }

  async getParticipantById(req: Request<{ participantId: string }>, res: Response, next: NextFunction) {
    const { participantId } = req.params;
    const useCase = new GetParticipantByIdUseCase(this.db);

    try {
      const participant = await useCase.execute({ participantId });
      return res.status(200).json(participant);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      throw error;
    }
  }
}