import type { Location } from "@domain/entities/Location.js";
import { RequiredIDError } from "@domain/errors/GlobalError.js";
import { LocationNotFoundError } from "@domain/errors/LocationErrors.js";
import type { IDatabaseService } from "@domain/services/IDatabaseService.js";


export interface GetLocationByIdUseCaseInput {
    locationId?: string;
}


export interface GetLocationByIdUseCaseOutput{
    location: Location;
}

export class GetLocationByIdUseCase{
    constructor(private db: IDatabaseService) {}

    async execute(input: GetLocationByIdUseCaseInput): Promise<GetLocationByIdUseCaseOutput>{
        
        if(!input.locationId){
            throw new RequiredIDError()
        }
        
        const location = await this.db.getLocationById(input.locationId)
        
        if(!location){
            throw new LocationNotFoundError()
        }

        return {location}
        
    }
}