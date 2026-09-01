import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { UserRole } from "../../types/user-role";
import useAuth from "../hooks/use-auth";

export interface AuthGuardProps{
    redirectPath?: string;
    allowedRoles?: UserRole[];
}

export function AuthGuard({
    allowedRoles,
    children
}: PropsWithChildren<AuthGuardProps>){
    const {currentUser} = useAuth()
    
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