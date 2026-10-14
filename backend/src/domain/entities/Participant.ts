import type { Location } from "./Location.js";

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  locationId: string;
  location?: Location | null;
  documentNumber: string;
  birthDate?: Date | null;
  email?: string | null;
  phone?: string | null;
  isActive: boolean;
  created_at: Date;
}
