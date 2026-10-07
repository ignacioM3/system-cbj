import { GetAllParticipantByLocationUseCase} from "@domain/use-cases/participant/GetAllParticipantByLocationUseCase.js";
import type { DatabaseService } from "../services/DatabaseService.js";
import { CreateParticipantUseCase } from "@domain/use-cases/participant/CreateParticipant.js";
import { UpdateParticipantUseCase } from "@domain/use-cases/participant/UpdateParticipantUseCase.js";
import type { UpdateParticipantInput } from "@domain/use-cases/participant/UpdateParticipantUseCase.js";
import { AppError } from "@domain/errors/AppError.js";
import type { Request, Response } from "express";

export class ParticipantControllers {
      constructor(private db: DatabaseService) {}

        async getParticipantsByLocationId(req: any, res: any) {
            const useCase = new GetAllParticipantByLocationUseCase(this.db);
            const { locationId } = req.params;

            const participants = await useCase.execute({locationId});
                res.status(200).json(participants)

        }


        async createParticipant(req: any, res: any) {
            const { locationId } = req.params;
            const newUser = {
                ...req.body,
                locationId: locationId,
            }
            
            const useCase = new CreateParticipantUseCase(this.db);
            const result = await useCase.execute({ newUser });
            res.status(201).json(result);
        }

        async editParticipant(
            req: Request<{ participantId: string }, any, UpdateParticipantInput["updateData"]>,
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
}