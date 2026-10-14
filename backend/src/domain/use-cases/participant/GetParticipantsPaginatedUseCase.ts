import type { Participant } from "@domain/entities/Participant.js";
import type { IDatabaseService } from "@domain/services/IDatabaseService.js";

export interface GetParticipantsPaginatedInput {
  page?: number;
  limit?: number;
  locationId?: string;
  isActive: boolean;
}

export interface GetParticipantsPaginatedOutput {
  participants: Participant[];
  total: number;
}

export class GetParticipantsPaginatedUseCase {
  constructor(private db: IDatabaseService) {}

  async execute(
    input: GetParticipantsPaginatedInput,
  ): Promise<GetParticipantsPaginatedOutput> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 6;
    const locationId = input.locationId ?? "";

    const skip = (page - 1) * limit;
    return this.db.getParticipantsPaginated(
      skip,
      limit,
      input.isActive,
      locationId,
    );
  }
}
