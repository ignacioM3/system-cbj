import { isAxiosError } from "axios";
import api from "../lib/axios";
import type { UserWithRelations } from "../types/User";

interface UserListResponse {
  users: UserWithRelations[];
  total: number;
}

export async function gettAllUserCoordinator(page: number, limit?: number): Promise<UserListResponse> {
  try {
    const url = `/users/list-coordinator?page=${page}&limit=${limit || 6}`;
   
    const { data } = await api.get(url);
    return data
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      console.log(error)
      throw new Error(error.response.data.error);
    }
    throw new Error("Unexpected error occurred");
  }
}