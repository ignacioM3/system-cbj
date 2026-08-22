import { isAxiosError } from "axios";
import api from "../lib/axios";
import type { Location } from "../types/Location";

interface LocationsListResponse {
  locations: Location[];
  total: number;
}

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
