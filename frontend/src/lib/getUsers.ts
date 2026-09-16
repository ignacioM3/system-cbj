import type { User } from "../types/User";
import { UserRole } from "../types/user-role";

export function getCoordinators(users: User[]): User[] {
  return users.filter(
    (user) => user.role === UserRole.COORDINATOR
  );
}

export function getEquipment(users: User[]): User[] {
  return users.filter(
    (user) => user.role === UserRole.EQUIPMENT
  );
}

export function getTutors(users: User[]): User[] {
  return users.filter(
    (user) => user.role === UserRole.TUTOR
  );
}


