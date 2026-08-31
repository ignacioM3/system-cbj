import { UserRole } from "../types/user-role";

export const getUserRoleLabel = (role?: UserRole): string => {
  const roles: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Admin",
    [UserRole.COORDINATOR]: "Coordinador",
    [UserRole.EQUIPMENT]: "Equipo",
    [UserRole.TUTOR]: "Tutor",
  };

  return role ? roles[role] : "";
};