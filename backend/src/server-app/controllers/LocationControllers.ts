import type { Location } from "@domain";
import type { DatabaseService } from "../services/DatabaseService.js";
import type { Request, Response } from "express";
import { CreateLocationUseCase } from "@domain/use-cases/locations/CreateLocation.js";
import { GetAllLocationsUseCase } from "@domain/use-cases/locations/GetAllLocations.js";

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
}
