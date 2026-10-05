import type { UserRole } from "../entities/User-Role.js";
import type { User } from "../entities/Users.js";
import type { Location } from "../entities/Location.js";
import type { Participant } from "@domain/entities/Participant.js";

export interface IDatabaseService {
  getUserById(id: string): Promise<User | null>;
  deleteUserById(id: string): Promise<void>;
  getAllUser(): Promise<User[]>;
  getUserByEmail(email: string): Promise<User | null>
  getUserForAuth(id: string): Promise<Omit<User, "password"> | null>
  getAllUsersByRole(role: UserRole): Promise<User[]>;
  getUsersByRolePaginated(role: UserRole, skip: number, limit: number): Promise<{ users: User[]; total: number }>
  createUserWithRole(user: Omit<User, "id" | "isActive">): Promise<User>
  disableUserById(id: string): Promise<void>;
  //location
  createLocation(location: Omit<Location, 'id' | 'isActive'>): Promise<Location>;
  getAllLocation(isActive: boolean): Promise<{locations: Location[], total: number}>
  getLocationById(id: string): Promise<Location | null>;
  updateLocation(locationId: string, updateData: Partial<Location>): Promise<Location>;

  //participant
   getParticipantByLocationId(id: string): Promise<Participant[] | null>;
  getParticipantByDocumentNumberAndLocationId(documentNumber: string, locationId: string): Promise<Participant | null>;
  createParticipant(participant: Omit<Participant, "id" | "isActive" | "created_at">): Promise<Participant>;
}
    