import { GetAllParticipantByLocationUseCase} from "@domain/use-cases/participant/GetAllParticipantByLocationUseCase.js";
import type { DatabaseService } from "../services/DatabaseService.js";
import { CreateParticipantUseCase } from "@domain/use-cases/participant/CreateParticipant.js";

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
}