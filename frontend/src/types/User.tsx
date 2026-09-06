import z from "zod";
import { UserRole } from "./user-role";
import type { Location } from "./Location";

const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  documentNumber: z.string(),
  email: z.string().email(),
  password: z.string(),
  birthDate: z.date().optional(),
  phone: z.string().optional(),
  isActive: z.boolean(),
  locationId: z.string(),
  role: z.enum([UserRole.ADMIN, UserRole.COORDINATOR, UserRole.EQUIPMENT, UserRole.TUTOR] as const),
});

export type UserWithRelations = User & {
    location: Location
}

export type Auth = z.infer<typeof userSchema>;
export type UserLoginForm = Pick<Auth, "email" | "password">;
export type UserLogged = Omit<Auth, "password">;


export type User = z.infer<typeof userSchema>;