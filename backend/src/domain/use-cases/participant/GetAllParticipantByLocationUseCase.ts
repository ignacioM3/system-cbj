import type { Participant } from "@domain/entities/Participant.js";
import { RequiredIDError } from "@domain/errors/GlobalError.js";
import { LocationNotFoundError } from "@domain/errors/LocationErrors.js";
import type { IDatabaseService } from "@domain/services/IDatabaseService.js";


export interface GetAllParticipantByLocationInput {
  locationId?: string;
}

export interface GetAllParticipantByLocationOutput {
  participants: Participant[];
  locationName: string
}

export class GetAllParticipantByLocationUseCase {
  constructor(private db: IDatabaseService) {}

  async execute(
    input: GetAllParticipantByLocationInput,
  ): Promise<GetAllParticipantByLocationOutput> {

    if (!input.locationId) {
      throw new RequiredIDError();
    }
    const location = await this.db.getLocationById(input.locationId);
    const locationName = location?.name ?? "Sede";

    const participants = await this.db.getParticipantByLocationId(
      input.locationId,
    );
    if (!participants) {
      throw new LocationNotFoundError();
    }

    return { participants, locationName };
  }
}
