import type { UserRole } from "../entities/User-Role.js";
import type { User } from "../entities/Users.js";
import type { Location } from "../entities/Location.js";

export interface IDatabaseService {
  getUserById(id: string): Promise<User | null>;
  deleteUserById(id: string): Promise<void>;
  getAllUser(): Promise<User[]>;
  getUserByEmail(email: string): Promise<User | null>
  getUserForAuth(id: string): Promise<Omit<User, "password"> | null>
  getAllUsersByRole(role: UserRole): Promise<User[]>;
  getUsersByRolePaginated(role: UserRole, skip: number, limit: number): Promise<{ users: User[]; total: number }>
  createUserWithRole(user: Omit<User, "id" | "isActive">): Promise<User>
  //location
  createLocation(location: Omit<Location, 'id' | 'isActive'>): Promise<Location>;
  getAllLocation(isActive: boolean): Promise<{locations: Location[], total: number}>
}
    