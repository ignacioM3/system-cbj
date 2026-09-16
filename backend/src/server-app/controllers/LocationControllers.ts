import type { Location } from "@domain";
import type { DatabaseService } from "../services/DatabaseService.js";
import type { Request, Response } from "express";
import { CreateLocationUseCase } from "@domain/use-cases/locations/CreateLocation.js";
import { GetAllLocationsUseCase } from "@domain/use-cases/locations/GetAllLocations.js";
import { GetLocationByIdUseCase } from "@domain/use-cases/locations/GetLocationById.js";
import { UpdateLocationUseCase } from "@domain/use-cases/locations/EditLocation.js";

export class LocationControllers {
  constructor(private db: DatabaseService) {}

  async createLocation(
    req: Request<any, any, Omit<Location, "id" | "isActive">>,
    res: Response,
  ) {
    const useCase = new CreateLocationUseCase(this.db);
    const newLocation = await useCase.execute({ newLocation: req.body });

    return res.status(201).json(newLocation);
  }

  async getAllLocationsActive(req: Request, res: Response) {
    const useCase = new GetAllLocationsUseCase(this.db);

    const allLocations = await useCase.execute({
      isActive: true,
    });

    return res.status(200).json(allLocations);
  }

  async getLocationById(req: Request<{locationId: string}>, res: Response){
    const useCase = new GetLocationByIdUseCase(this.db);
    const {locationId} = req.params

    const location = await useCase.execute({locationId})
    res.status(200).json(location)
  }

  async editLocationName(req: Request<{locationId: string}, any, Partial<Location>>, res: Response){
    const {locationId} = req.params
    const {name} = req.body
    if(!name || name.trim() === ""){
      return res.status(400).json({error: "El nombre no puede estar vacío"})
    }
    
    const useCase = new UpdateLocationUseCase(this.db)

    const location = await useCase.execute(locationId, {updateData: req.body})

    res.status(200).json(location)
  }
}
