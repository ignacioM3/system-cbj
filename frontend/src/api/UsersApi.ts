import { isAxiosError } from "axios";
import api from "../lib/axios";
import type { CreateUserForm, User, UserWithRelations } from "../types/User";

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

export async function deleteUser(deleteUserId: string): Promise<string> {
  try {

    const url = `/users/delete/${deleteUserId}`;
    const { data } = await api.post(url);

    return data;

  } catch (error) {
    if (isAxiosError(error) && error.response) {
      console.log(error)
      throw new Error(error.response.data.error);
    } else {
      throw new Error("Unexpected error occurred");
    }
  }
}

export async function createUserCoordinator(createUserData: CreateUserForm): Promise<User> {
  try {
    const url = "/users/create/coordinator";
    const { data } = await api.post(url, createUserData);
    console.log(data)
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      console.log(error);
      throw new Error(error.response.data.error);
    }
    throw new Error("Unexpected error occurred");
  }
}


export async function gettAllUserEquipment(page: number, limit?: number, locationId?: string): Promise<UserListResponse> {
  try {
    const url = `/users/list-equipment/${locationId}?page=${page}&limit=${limit || 6}`;
   
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

export async function createUserEquipment(createUserData: CreateUserForm, locationId: string): Promise<User> {
  try {
    console.log(locationId)
    const url = `/users/create/equipment/${locationId}`;
    const { data } = await api.post(url, createUserData);
    console.log(data)
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      console.log(error);
      throw new Error(error.response.data.error);
    }
    throw new Error("Unexpected error occurred");
  }
}