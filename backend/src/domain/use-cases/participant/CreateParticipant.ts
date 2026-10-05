import { DocumentNumberAlreadyExistsError, EmailAlreadyExistsError, type User, type UserRole } from "@domain";
import type { IDatabaseService } from "../../services/IDatabaseService.js";
import type { Participant } from "../../entities/Participant.js";

export interface CreateParticipantInput {
  newUser: Omit<Participant, "id" | "isActive" | "role" | "created_at">;

}

export interface CreateParticipantOutput {
  createdParticipant: Participant;
}

export class CreateParticipantUseCase {
  constructor(private db: IDatabaseService) {}

  async execute(input: CreateParticipantInput): Promise<CreateParticipantOutput> {
    const existingParticipant = await this.db.getParticipantByDocumentNumberAndLocationId(input.newUser.documentNumber, input.newUser.locationId);

    if (existingParticipant) {
      throw new DocumentNumberAlreadyExistsError();
    }

    const createdParticipant = await this.db.createParticipant({
      ...input.newUser
    });
    return { createdParticipant };
  }
}
