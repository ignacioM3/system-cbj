import type { Location } from "@domain/entities/Location.js";
import type { IDatabaseService } from "@domain/services/IDatabaseService.js";

export interface GetAllLocationsInput{
    isActive: boolean;
}

export interface GettAllLocationsOutput{
    locations: Location[];
    total: number
}

export class GetAllLocationsUseCase {
  constructor(private db: IDatabaseService) {}

  async execute(input: GetAllLocationsInput): Promise<GettAllLocationsOutput> {

    return this.db.getAllLocation(
      input.isActive
    );
  }
}
