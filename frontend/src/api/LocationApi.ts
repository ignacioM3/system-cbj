import { isAxiosError } from "axios";
import api from "../lib/axios";
import type { CreateLocationDataForm, Location, LocationsListResponse } from "../types/Location";

export async function getAllLocationsActive(): Promise<LocationsListResponse> {
  try {
    const url = `/location/locations/active`;
    const { data } = await api.get(url);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      console.log(error);
      throw new Error(error.response.data.error);
    }
    throw new Error("Unexpected error occurred");
  }
}

export async function createLocationApi(createLocationData: CreateLocationDataForm): Promise<Location> {
  try {
    const url = "/location/create";
    const { data } = await api.post(url, createLocationData);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      console.log(error);
      throw new Error(error.response.data.error);
    }
    throw new Error("Unexpected error occurred");
  }
}
