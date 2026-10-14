import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sileo } from "sileo";

import { AppRoutes } from "../../../app/routes/routes";
import { PageContainer } from "../../../shared/ui/styles/PageContainer";
import { PageHeader } from "../../../shared/ui/styles/PageHeader";
import { PageTitle } from "../../../shared/ui/styles/PageTitle";
import { PageContent } from "../../../shared/ui/styles/PageContent";
import ErrorLabel from "../../../shared/ui/form/ErrorMessage";

import {
  getParticipantByIdApi,
  editParticipantApi,
} from "../../../api/ParticipantApi";

import type { CreateParticipantForm } from "../../../types/Participant";

type ParticipantForm = Omit<
  CreateParticipantForm,
  "locationId" | "birthDate"
> & {
  birthDate: string;
};

export function EditParticipant() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ParticipantForm>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      documentNumber: "",
      birthDate: "",
      phone: "",
    },
  });

const {
  data: participant,
  isLoading,
  isError,
} = useQuery({
  queryKey: ["participantDetails", id],
  queryFn: () => getParticipantByIdApi(id!),
  enabled: Boolean(id),
  retry: false,
});

useEffect(() => {
  if (!participant) return;

  const formData: ParticipantForm = {
    firstName: participant.firstName ?? "",
    lastName: participant.lastName ?? "",
    documentNumber: String(participant.documentNumber ?? ""),
    email: participant.email ?? "",
    birthDate: participant.birthDate
      ? String(participant.birthDate).slice(0, 10)
      : "",
    phone: participant.phone ?? "",
  };


  reset(formData);
}, [participant, reset]);


  const { mutate, isPending } = useMutation({
    mutationFn: editParticipantApi,

    retry: false,

    onError: (error) => {
      sileo.error({
        title: error.message,
      });
    },

    onSuccess: () => {
      sileo.success({
        title: "Participante actualizado exitosamente",
      });

      queryClient.invalidateQueries({
        queryKey: ["participantDetails", id],
      });

      queryClient.invalidateQueries({
        queryKey: ["getAllParticipantsByLocationId"],
      });

      navigate(AppRoutes.listParticipantByLocation.route());
    },
  });

  const handleEditParticipant = (data: ParticipantForm) => {
    if (!id) return;
    
    mutate({
      participantId: id,
      ...data,
      birthDate: data.birthDate
        ? new Date(`${data.birthDate}T12:00:00`)
        : undefined,
    });
  };

  if (isLoading) {
  return (
    <PageContainer>
      <PageContent>
        <p className="text-center">Cargando participante...</p>
      </PageContent>
    </PageContainer>
  );
}

if (isError || !participant) {
  return (
    <PageContainer>
      <PageContent>
        <p className="text-center">
          No se pudo cargar el participante.
        </p>
      </PageContent>
    </PageContainer>
  );
}
  return (
    <PageContainer>
      <PageHeader
        goBack={true}
        nameBack="Listado"
        backString={AppRoutes.listParticipantByLocation.route()}
      >
        <PageTitle>Editar Participante</PageTitle>
      </PageHeader>

      <PageContent>
        <div className="mx-auto w-full max-w-200 rounded-2xl border border-gray-300 bg-white p-6 shadow-lg">
          <form
            className="space-y-6"
            onSubmit={handleSubmit(handleEditParticipant)}
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-1 font-medium text-[#5C4630]">
                  Nombre
                  {errors.firstName && (
                    <ErrorLabel className="text-[12px]">
                      {errors.firstName.message}
                    </ErrorLabel>
                  )}
                </label>

                <input
                  {...register("firstName", {
                    required: "El nombre es requerido",
                  })}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#656766]"
                  placeholder="Ej: Ignacio"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1 font-medium text-[#5C4630]">
                  Apellido
                  {errors.lastName && (
                    <ErrorLabel className="text-[12px]">
                      {errors.lastName.message}
                    </ErrorLabel>
                  )}
                </label>

                <input
                  {...register("lastName", {
                    required: "El apellido es requerido",
                  })}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#656766]"
                  placeholder="Ej: Flores"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1 font-medium text-[#5C4630]">
                  Documento
                  {errors.documentNumber && (
                    <ErrorLabel className="text-[12px]">
                      {errors.documentNumber.message}
                    </ErrorLabel>
                  )}
                </label>

                <input
                  type="text"
                  {...register("documentNumber", {
                    required: "El documento es requerido",
                  })}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#656766]"
                  placeholder="Ej: 23323323"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1 font-medium text-[#5C4630]">
                  Email (opcional)
                </label>

                <input
                  type="email"
                  {...register("email")}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#656766]"
                  placeholder="Ej: ignacio@gmail.com"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1 font-medium text-[#5C4630]">
                  Fecha de nacimiento
                  {errors.birthDate && (
                    <ErrorLabel className="text-[12px]">
                      {errors.birthDate.message}
                    </ErrorLabel>
                  )}
                </label>

                <input
                  type="date"
                  {...register("birthDate", {
                    required: "La fecha es requerida",
                  })}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#656766]"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1 font-medium text-[#5C4630]">
                  Celular (opcional)
                </label>

                <input
                  type="text"
                  {...register("phone")}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#656766]"
                  placeholder="Ej: 1133224433"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 border-t border-gray-300 pt-6">
              <button
                type="button"
                onClick={() =>
                  navigate(AppRoutes.listParticipantByLocation.route())
                }
                className="cursor-pointer rounded-xl border border-gray-300 px-6 py-3 text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="cursor-pointer rounded-xl bg-blue-500 px-6 py-3 font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </PageContent>
    </PageContainer>
  );
}
