import type { Location } from "../../entities/Location.js";
import type { IDatabaseService } from "../../services/IDatabaseService.js";
export interface CreateLocationInput {
    newLocation: Omit<Location, 'id' | 'isActive'>
}

export interface CreateLocationOutput {
    location: Location;
}

export class CreateLocationUseCase {
    constructor(private db: IDatabaseService){}

    async execute(input: CreateLocationInput): Promise<CreateLocationOutput> {
        const createdLocation = await this.db.createLocation(input.newLocation);
        
        return { location: createdLocation };
    }
}