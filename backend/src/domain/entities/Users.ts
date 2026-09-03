import type { Location } from "./Location.js";
import type { UserRole } from "./User-Role.js";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber?: string;
  birthDate?: Date;
  password: string;
  email: string;
  phone?: string;
  isActive: boolean;
  role: UserRole;

  locationId: string | null;
  location?: Location | null;
}