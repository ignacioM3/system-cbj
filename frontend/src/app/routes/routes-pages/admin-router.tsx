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
    createUserCoordinator:  {
        route: () => "/dashboard/users/add/coordinator",
        layout: adminLayoutImport,
        page: async () => (await import('../../../features/admin/pages/CreateCoordinator')).CreateCoordinator,
        requiresAuth: true,
        allowedRoles: [UserRole.ADMIN],
    },
    locationDetails: {
        route: (id?: string) => `/dashboard/location/details/${id ?? ":id"}`,
        layout: adminLayoutImport,
        page: async () => (await import('../../../features/admin/pages/LocationDetails')).LocationDetails,
        requiresAuth: true,
        allowedRoles: [UserRole.ADMIN, UserRole.COORDINATOR],
    },
      listParticipantByLocation: {
        route: () => `/dashboard/participants/list`,
        layout: adminLayoutImport,
        page: async () => (await import('../../../features/admin/pages/ListParticipant')).ListParticipant,
        requiresAuth: true,
        allowedRoles: [UserRole.COORDINATOR, UserRole.EQUIPMENT],
    },
    createParticipant:{
        route: (id?: string) => `/dashboard/participants/add/${id ?? ":id"}`,
        layout: adminLayoutImport,
        page: async () => (await import('../../../features/admin/pages/CreateParticipant')).CreateParticipant,
        requiresAuth: true,
        allowedRoles: [UserRole.COORDINATOR, UserRole.EQUIPMENT, UserRole.ADMIN],
    },
    editParticipant:{
        route: (id?: string) => `/dashboard/participants/edit/${id ?? ":id"}`,
        layout: adminLayoutImport,
        page: async () => (await import('../../../features/admin/pages/EditParticipantPage')).EditParticipant,
        requiresAuth: true,
        allowedRoles: [UserRole.COORDINATOR, UserRole.EQUIPMENT, UserRole.ADMIN],
    }
}