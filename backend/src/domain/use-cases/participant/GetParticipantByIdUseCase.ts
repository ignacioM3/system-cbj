
import { RequiredIDError } from "@domain/errors/GlobalError.js";
import type { IDatabaseService } from "@domain/services/IDatabaseService.js";
import { UserNotFoundError, type Participant } from "@domain";


export interface GetParticipantByIdUseCaseInput {
    participantId?: string;
}


export interface GetParticipantByIdUseCaseOutput{
    participant: Participant;
}

export class GetParticipantByIdUseCase{
    constructor(private db: IDatabaseService) {}

    async execute(input: GetParticipantByIdUseCaseInput): Promise<GetParticipantByIdUseCaseOutput>{
        
        if(!input.participantId){
            throw new RequiredIDError()
        }
        
        const participant = await this.db.getParticipantById(input.participantId)
        
        if(!participant){
            throw new UserNotFoundError()
        }

        return {participant}
        
    }
}