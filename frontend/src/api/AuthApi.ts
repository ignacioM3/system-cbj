import { isAxiosError } from "axios";
import type { UserLogged, UserLoginForm } from "../types/User";
import api from "../lib/axios";

export async function authLogin(
    formData: UserLoginForm,
    setCurrentUser: (user: UserLogged) => void
) {
    try {
        const url = '/auth/login'
        const { data } = await api.post<string>(url, formData);
        localStorage.setItem("AUTH_TOKEN", data);
        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${data}`,
            },
        };

        const { data: userData } = await api.get<UserLogged>(
            "/auth/perfil",
            config
        );
        setCurrentUser(userData);

        return userData
    } catch (error) {
        if (isAxiosError(error) && error.response) {
            console.log(error)
            throw new Error(error.response.data.error);
        }
    }
}