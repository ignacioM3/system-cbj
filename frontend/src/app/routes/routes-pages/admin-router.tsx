
const adminLayoutImport = async () =>
    (await import('../../../layout/DashboardLayout')).DashboardLayout 

export const adminRoutes = {
    homeAdmin: {
        route: () => "/dashboard/home",
        layout: adminLayoutImport,
        page: async () => (await import('../../../features/dashboard/pages/Home')).Home,
    },
    locationsList: {
          route: () => "/dashboard/locations/list",
        layout: adminLayoutImport,
        page: async () => (await import('../../../features/dashboard/pages/LocationsList')).LocationsList,
    },
    createLocation: {
        route: () => "/dashboard/locations/add",
        layout: adminLayoutImport,
        page: async () => (await import('../../../features/dashboard/pages/CreateLocation')).CreateLocation,
    }
}