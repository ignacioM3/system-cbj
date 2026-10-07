import type { Participant } from "@domain/entities/Participant.js";
import type { IDatabaseService } from "@domain/services/IDatabaseService.js";

import { RequiredIDError } from "@domain/errors/GlobalError.js";
import {
  ParticipantInactiveError,
  ParticipantNotFoundError,
} from "@domain/errors/ParticipantErrors.js";

import { DocumentNumberAlreadyExistsError } from "@domain/errors/UsersErrors.js";
import { EmailAlreadyExistsError } from "@domain/errors/AuthErrors.js";

export interface UpdateParticipantInput {
  updateData: Partial<Participant>;
}

export interface UpdateParticipantOutput {
  updatedParticipant: Participant;
}

export class UpdateParticipantUseCase {
  constructor(private db: IDatabaseService) {}

  async execute(
    participantId: string,
    input: UpdateParticipantInput,
  ): Promise<UpdateParticipantOutput> {
    if (!participantId) {
      throw new RequiredIDError();
    }

    const participant = await this.db.getParticipantById(participantId);

    if (!participant) {
      throw new ParticipantNotFoundError();
    }

    if (!participant.isActive) {
      throw new ParticipantInactiveError();
    }

    if (input.updateData.documentNumber !== undefined) {
      const existing =
        await this.db.getParticipantByDocumentNumberAndLocationId(
          input.updateData.documentNumber,
          participant.locationId,
        );

      if (existing && existing.id !== participant.id) {
        throw new DocumentNumberAlreadyExistsError();
      }
    }

    if (input.updateData.email) {
      const existing = await this.db.getParticipantByEmailAndLocationId(
        input.updateData.email,
        participant.locationId,
      );

      if (existing && existing.id !== participant.id) {
        throw new EmailAlreadyExistsError();
      }
    }

    const updatedParticipant = await this.db.updateParticipant(
      participantId,
      input.updateData,
    );

    return { updatedParticipant };
  }
}