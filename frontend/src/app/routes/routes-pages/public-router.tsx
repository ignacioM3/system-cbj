
const appLayoutImport = async () =>
    (await import('../../../layout/HomeLayout')).HomeLayout 

export const publicRoutes = {
    login: {
        route: () => "/login",
        layout: appLayoutImport,
        page: async () => (await import('../../../features/public/pages/Login')).Login,
    },
    attendance: {
        route: (id?: string) => `/attendance/${id?? ":id"}`,
        layout: appLayoutImport,
        page: async () => (await import('../../../features/public/pages/AttendencesPublic')).AttendancePage,
    }
}