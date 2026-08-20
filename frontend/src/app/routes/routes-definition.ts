    import type { FunctionComponent, PropsWithChildren } from "react";
    import type { UserRole } from "../../types/user-role";

    export interface RouterDefinition {
        route: (...args: string[]) => string;
        layout?: () => Promise<FunctionComponent>;
        page?: () => Promise<FunctionComponent<PropsWithChildren>>;
        requiresAuth?: boolean;
        allowedRoles?: UserRole[];
        redirect?: string
    }