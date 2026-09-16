import { isAxiosError } from "axios";
import api from "../lib/axios";
import type { CreateLocationDataForm, Location, LocationDetailsResponse, LocationsListResponse } from "../types/Location";

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


export async function getLocationById(locationId?: string): Promise<LocationDetailsResponse> {
  try {
    const url = `/location/details/${locationId}`;
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

export interface EditLocationNameInput {
  locationId: string;
  name: string;
}

export async function editLocationNameApi({
  locationId,
  name,
}: EditLocationNameInput): Promise<string> {
  try {
    const url = `/location/editName/${locationId}`;

    const { data } = await api.put(url, {
      name,
    });

    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      console.log(error);
      throw new Error(error.response.data.error);
    }

    throw new Error("Unexpected error occurred");
  }
}