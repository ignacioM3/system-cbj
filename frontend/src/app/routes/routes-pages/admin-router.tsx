
const adminLayoutImport = async () =>
    (await import('../../../layout/DashboardLayout')).DashboardLayout 

export const adminRoutes = {
    homeAdmin: {
        route: () => "/dashboard/home",
        layout: adminLayoutImport,
        page: async () => (await import('../../../features/dashboard/pages/Home')).Home,
    }
}