export const UserRole = {
    ADMIN: 'Admin',
    COORDINATOR: 'Coordinator',
    EQUIPMENT: 'Equipment',
    TUTOR: 'Tutor',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole] 