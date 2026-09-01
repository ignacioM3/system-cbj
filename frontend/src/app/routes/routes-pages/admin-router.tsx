import { UserRole } from '../../../types/user-role';

const adminLayoutImport = async () =>
    (await import('../../../layout/DashboardLayout')).DashboardLayout 

export const adminRoutes = {
    homeAdmin: {
        route: () => "/dashboard/home",
        layout: adminLayoutImport,
        page: async () => (await import('../../../features/admin/pages/Home')).Home,
        requiresAuth: true,
    },
    locationsList: {
          route: () => "/dashboard/locations/list",
        layout: adminLayoutImport,
        page: async () => (await import('../../../features/admin/pages/LocationsList')).LocationsList,
        requiresAuth: true,
        allowedRoles: [UserRole.ADMIN],
    },
    createLocation: {
        route: () => "/dashboard/locations/add",
        layout: adminLayoutImport,
        page: async () => (await import('../../../features/admin/pages/CreateLocation')).CreateLocation,
        requiresAuth: true,
        allowedRoles: [UserRole.ADMIN],
    },
    listUsersCoordinator: {
        route: () => "/dashboard/users/list-coordinator",
        layout: adminLayoutImport,
        page: async () => (await import('../../../features/admin/pages/ListUsersCoordinator')).ListUsersCoordinator,
        requiresAuth: true,
        allowedRoles: [UserRole.ADMIN],
    },
}