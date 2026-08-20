import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { UserRole } from "../../types/user-role";

export interface AuthGuardProps{
    redirectPath?: string;
    allowedRoles?: UserRole[];
}

export function AuthGuard({
    allowedRoles,
    children
}: PropsWithChildren<AuthGuardProps>){
     const currentUser = {
        role: UserRole.ADMIN
     }; 
    if(allowedRoles && !currentUser){
        return <Navigate to="/"/>
    }

      if (
        currentUser &&
        allowedRoles &&
        !allowedRoles.includes(currentUser.role)
    ) {
        return <Navigate to="/" />;
    }

    return <>
        {children}
    </>
}