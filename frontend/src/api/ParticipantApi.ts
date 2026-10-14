import axios, { isAxiosError } from "axios";
import api from "../lib/axios";
import type {
  ParticipantWithRelation,
  CreateParticipantForm,
  Participant,
  UpdateParticipantData
} from "../types/Participant";

interface ParticipantListResponse {
  participants: ParticipantWithRelation[];
  total: number;
}

export async function getAllParticipantsByLocationId(
  locationId: string = "",
  page: number,
  limit?: number,
): Promise<ParticipantListResponse> {
  try {
    const url = `/participant/list-participant/${locationId}?page=${page}&limit=${limit || 8}`;

    const { data } = await api.get(url);
    console.log(data);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      console.log(error);
      throw new Error(error.response.data.error);
    }
    throw new Error("Unexpected error occurred");
  }
}

export async function createParticipantApi(
  createParticipant: CreateParticipantForm,
): Promise<Participant> {
  try {
    const url = "/participant/create";
    const { data } = await api.post(url, createParticipant);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Respuesta del backend:", error.response?.data);

      const message =
        error.response?.data?.message ??
        error.response?.data?.error;

      throw new Error(
        message || "No se pudo crear el participante"
      );
    }

    throw error;
  }
}

export async function toggleParticipantStatusApi(
  participantId: string,
): Promise<string> {
  try {
    const url = `/participant/toggle-status/${participantId}`;
    const { data } = await api.post(url);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Respuesta del backend:", error.response?.data);
      const message =
        error.response?.data?.message ??
        error.response?.data?.error;

      throw new Error(
        message || "No se pudo actualizar el estado del participante"
      );
    }

    throw error;
  }
}

export async function getParticipantByIdApi(
  participantId: string
): Promise<Participant> {
  try {
    const url = `/participant/details/${participantId}`;
    const { data } = await api.get(url);
    return data.participant
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Respuesta del backend:", error.response?.data);
      const message =
        error.response?.data?.message ??
        error.response?.data?.error;
      throw new Error(
        message || "No se pudo obtener el participante"
      );
    }

    throw error;
  }
}

export async function editParticipantApi({
  participantId,
  ...updateData
}: UpdateParticipantData): Promise<string> {
  try {
    const url = `/participant/edit/${participantId}`;

    const { data } = await api.put(url, updateData);

    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || "Error al editar el participante",
      );
    }

    throw new Error("Unexpected error occurred");
  }
}

export async function getAllParticipantsBYLocationIdApi(locationId: string): Promise<{ participants: ParticipantWithRelation[]; locationName: string }> {
  try {
    const url = `/participant/participants/${locationId}`;
    const { data } = await api.get(url);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || "Error al obtener los participantes",
      );
    }

    throw new Error("Unexpected error occurred");
  }
}