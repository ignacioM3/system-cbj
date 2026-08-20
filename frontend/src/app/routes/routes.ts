import type { RouterDefinition } from "./routes-definition";
import { adminRoutes } from "./routes-pages/admin-router";
import { publicRoutes } from "./routes-pages/public-router";

export const AppRoutes = {
  ...publicRoutes,
  ...adminRoutes,
  home: {
    route: () => "/",
    redirect: "/login",
  },
  error: {
    route: () => "*",
    redirect: "",
  },
} as const satisfies Record<string, RouterDefinition>;

export type Routes = keyof typeof AppRoutes;

export const routeList: RouterDefinition[] = Object.values(AppRoutes);
