import type { Location } from "@domain/entities/Location.js";
import type { IDatabaseService } from "@domain/services/IDatabaseService.js";
import { RequiredIDError } from "@domain/errors/GlobalError.js";

export interface UpdateLocationInput{
    updateData: Partial<Location>
}

export interface UpdateLocationOutput{
    updatedLocation: Location
}

export class UpdateLocationUseCase{
     constructor(private db: IDatabaseService) { }

    async execute(locationId: string, input: UpdateLocationInput): Promise<UpdateLocationOutput> {
        if (!locationId) {
            throw new RequiredIDError()
        }
        const updatedLocation = await this.db.updateLocation(locationId, input.updateData)

        return { updatedLocation }
    }

}