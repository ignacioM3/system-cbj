import z from "zod";
import { UserRole } from "./user-role";

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
  role: z.enum([UserRole.ADMIN, UserRole.COORDINATOR, UserRole.EQUIPMENT, UserRole.TUTOR] as const),
});

export type Auth = z.infer<typeof userSchema>;

export type UserLoginForm = Pick<Auth, "email" | "password">;
export type UserLogged = Omit<Auth, "password">;