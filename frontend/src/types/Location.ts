import { z } from "zod";
import type { User } from "./User";

const locationSchema = z.object({
     id: z.string(),
     name: z.string(),
     address: z.string(),
     isActive: z.boolean()
})


export type Location = z.infer<typeof locationSchema>
export type CreateLocationDataForm = Pick<Location, "name" | "address">


export interface LocationDetails extends Location { 
  users: User[]; 
} 

export interface LocationsListResponse {
  locations: LocationDetails[];
  total: number;
}
export interface LocationDetailsResponse { 
  location: LocationDetails; 
}