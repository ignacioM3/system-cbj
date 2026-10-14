import type { IDatabaseService } from "@domain/services/IDatabaseService.js";

export interface DisableAndActiveParticipantOutput {
  participantId: string;
}

export class DisableAndActiveParticipantUseCase {
  constructor(private db: IDatabaseService) { }


  async execute(
    participantId: string,
  ): Promise<DisableAndActiveParticipantOutput> {
    const toggledParticipantId = await this.db.toggleParticipantStatusById(
      participantId,
    );

    return { participantId: toggledParticipantId };
  }
}
