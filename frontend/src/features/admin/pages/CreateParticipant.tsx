import { useNavigate, useParams } from "react-router-dom";
import { PageContainer } from "../../../shared/ui/styles/PageContainer";
import { PageHeader } from "../../../shared/ui/styles/PageHeader";
import { PageTitle } from "../../../shared/ui/styles/PageTitle";
import { PageContent } from "../../../shared/ui/styles/PageContent";
import ErrorLabel from "../../../shared/ui/form/ErrorMessage";
import { useForm } from "react-hook-form";
import { AppRoutes } from "../../../app/routes/routes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sileo } from "sileo";
import type { CreateParticipantForm } from "../../../types/Participant";
import { createParticipantApi } from "../../../api/ParticipantApi";

export function CreateParticipant() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    documentNumber: "",
    birthDate: new Date(),
    phone: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Omit<CreateParticipantForm, "locationId">>({
    defaultValues: initialValues,
  });

  const { mutate } = useMutation({
    mutationFn: createParticipantApi,
    onError: (error) => {
      sileo.error({
        title: error.message,
      });
    },
    onSuccess: () => {
      sileo.success({ title: "Participante creado exitosamente" });
      queryClient.invalidateQueries({
        queryKey: ["getAllParticipantsByLocationId", id],
      });
      reset();
    },
  });

  const handleCreateParticipant = (
    data: Omit<CreateParticipantForm, "locationId">,
  ) => {
    const locationId = id || "";

    mutate({
      ...data,
      locationId,
    });
  };

  return (
    <PageContainer>
      <PageHeader
        goBack={true}
        nameBack="Listado"
        backString={AppRoutes.listParticipantByLocation.route()}
      >
        <PageTitle>Crear Participante</PageTitle>
      </PageHeader>
      <PageContent>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-300 max-w-200 mx-auto w-full">
          <form
            className="space-y-6"
            onSubmit={handleSubmit(handleCreateParticipant)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-md font-medium text-[#5C4630] mb-2 flex items-center gap-1">
                  Nombre{" "}
                  {errors.firstName && (
                    <ErrorLabel className="text-[12px]">
                      {errors.firstName.message}
                    </ErrorLabel>
                  )}
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...register("firstName", {
                    required: "El nombre es requerido",
                  })}
                  className={`w-full placeholder-gray-400 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#656766] focus:border-transparent  "}`}
                  placeholder="Ej: Ignacio Marquez"
                />
              </div>

              <div>
                <label className="text-md font-medium text-[#5C4630] mb-2 flex items-center gap-1">
                  Apellido{" "}
                  {errors.lastName && (
                    <ErrorLabel className="text-[12px]">
                      {errors.lastName.message}
                    </ErrorLabel>
                  )}
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...register("lastName", {
                    required: "El apellido es requerido",
                  })}
                  className={`w-full placeholder-gray-400 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#656766] focus:border-transparent  "}`}
                  placeholder="Ej: Flores"
                />
              </div>

              <div>
                <label className="text-md font-medium text-[#5C4630] mb-2 flex items-center gap-1">
                  Documento{" "}
                  {errors.documentNumber && (
                    <ErrorLabel className="text-[12px]">
                      {errors.documentNumber.message}
                    </ErrorLabel>
                  )}
                </label>

                <input
                  id="documentNumber"
                  type="number"
                  autoComplete="off"
                  {...register("documentNumber", {
                    required: "El número de documento es requerido",
                  })}
                  className={`w-full placeholder-gray-400 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#656766] focus:border-transparent  "}`}
                  placeholder="Ej: 23323323"
                />
              </div>

              <div>
                <label className="text-md font-medium text-[#5C4630] mb-2 flex items-center gap-1">
                  Email(Opcional){" "}
                  {errors.email && (
                    <ErrorLabel className="text-[12px]">
                      {errors.email.message}
                    </ErrorLabel>
                  )}
                </label>
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  className={`w-full placeholder-gray-400 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#656766]  focus:border-transparent  "}`}
                  placeholder="Ej: ignacio@gmail.com"
                />
              </div>

              <div>
                <label className="text-md font-medium text-[#5C4630] mb-2 flex items-center gap-1">
                  Fecha de Nacimiento{" "}
                  {errors.birthDate && (
                    <ErrorLabel className="text-[12px]">
                      {errors.birthDate.message}
                    </ErrorLabel>
                  )}
                </label>
                <input
                  id="birthDate"
                  type="date"
                  autoComplete="off"
                  {...register("birthDate", {
                    required: "La fecha es requerida",
                  })}
                  className={`w-full placeholder-gray-400 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#656766] focus:border-transparent  "}`}
                />
              </div>
              <div>
                <label className="text-md font-medium text-[#5C4630] mb-2 flex items-center gap-1">
                  Celular(Opcional){" "}
                  {errors.phone && (
                    <ErrorLabel className="text-[12px]">
                      {errors.phone.message}
                    </ErrorLabel>
                  )}
                </label>
                <input
                  id="phone"
                  type="text"
                  {...register("phone")}
                  className={`w-full placeholder-gray-400 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#656766] focus:border-transparent  "}`}
                  placeholder="Ej: 1133224433"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-300">
              <button
                type="button"
                onClick={() =>
                  navigate(AppRoutes.listParticipantByLocation.route())
                }
                className="px-6 cursor-pointer py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 cursor-pointer py-3 text-white rounded-xl bg-blue-500 hover:bg-blue-600 transition font-medium"
              >
                Crear Participante
              </button>
            </div>
          </form>
        </div>
      </PageContent>
    </PageContainer>
  );
}
