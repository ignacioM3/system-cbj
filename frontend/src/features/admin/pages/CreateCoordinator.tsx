import { useNavigate } from "react-router-dom";
import { PageContainer } from "../../../shared/ui/styles/PageContainer";
import { PageHeader } from "../../../shared/ui/styles/PageHeader";
import { PageTitle } from "../../../shared/ui/styles/PageTitle";
import { PageContent } from "../../../shared/ui/styles/PageContent";
import ErrorLabel from "../../../shared/ui/form/ErrorMessage";
import { useForm } from "react-hook-form";
import { AppRoutes } from "../../../app/routes/routes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLocationApi,
  getAllLocationsActive,
} from "../../../api/LocationApi";
import { sileo } from "sileo";
import LoadingSpinner from "../../../shared/ui/LoadingSpinner";
import type { CreateUserForm } from "../../../types/User";
import { createUserCoordinator } from "../../../api/UsersApi";

export function CreateCoordinator() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["getAllLocations"],
    queryFn: () => getAllLocationsActive(),
    retry: false,
  });

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    documentNumber: "",
    password: "",
    locationId: "",
    password_confirmation: "",
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: initialValues,
  });


  const password = watch("password")
  const { mutate } = useMutation({
    mutationFn: createUserCoordinator,
    onError: (error) => {
      sileo.error({ title: error.message });
    },
    onSuccess: () => {
      sileo.success({ title: "Coordinador creado exitosamente" });
      queryClient.invalidateQueries({ queryKey: ["getAllLocations"] });
      reset();
    },
  });

  const handleCreateLocation = (data: CreateUserForm) => {
    mutate(data);
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError || !data) {
    return <div>Error al cargar los centros</div>;
  }

  return (
    <PageContainer>
      <PageHeader
        goBack={true}
        nameBack="Listado"
        backString={AppRoutes.listUsersCoordinator.route()}
      >
        <PageTitle>Crear Coordinador</PageTitle>
      </PageHeader>
      <PageContent>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-300 max-w-200 mx-auto w-full">
          <form
            className="space-y-6"
            onSubmit={handleSubmit(handleCreateLocation)}
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
                  autoComplete="off"
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
                  autoComplete="off"
                  {...register("lastName", {
                    required: "El apellido es requerido",
                  })}
                  className={`w-full placeholder-gray-400 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#656766] focus:border-transparent  "}`}
                  placeholder="Ej: CBJ Munro"
                />
              </div>

              <div>
                <label className="text-md font-medium text-[#5C4630] mb-2 flex items-center gap-1">
                  Centros{" "}
                  {errors.locationId && (
                    <ErrorLabel className="text-[12px]">
                      {errors.locationId.message}
                    </ErrorLabel>
                  )}
                </label>

                <select
                  {...register("locationId", {
                    required: "Debe elegir una sede",
                  })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#656766] focus:border-transparent"
                >
                  <option value="">Seleccionar centro</option>

                  {data.locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-md font-medium text-[#5C4630] mb-2 flex items-center gap-1">
                  Email{" "}
                  {errors.email && (
                    <ErrorLabel className="text-[12px]">
                      {errors.email.message}
                    </ErrorLabel>
                  )}
                </label>
                <input
                  {...register("email", { required: "El email es requerido" })}
                  id="email"
                  type="email"
                  className={`w-full placeholder-gray-400 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#656766]  focus:border-transparent  "}`}
                  placeholder="Ej: coordinador@gmail.com"
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
                    required: "El DNI es requerido",
                  })}
                  className={`w-full placeholder-gray-400 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#656766] focus:border-transparent  "}`}
                  placeholder="Ej: 23323323"
                />
              </div>
              <div>
                <label className="text-md font-medium text-[#5C4630] mb-2 flex items-center gap-1">
                  Contraseña{" "}
                  {errors.password && (
                    <ErrorLabel className="text-[12px]">
                      {errors.password.message}
                    </ErrorLabel>
                  )}
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="off"
                  {...register("password", {
                    required: "La contraseña es obligatoria",
                  })}
                  className={`w-full placeholder-gray-400 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#656766] focus:border-transparent  "}`}
                />
              </div>

              <div>
                <label className="text-md font-medium text-[#5C4630] mb-2 flex items-center gap-1">
                  Repetir Contraseña{" "}
                  {errors.password_confirmation && (
                    <ErrorLabel className="text-[12px]">
                      {errors.password_confirmation.message}
                    </ErrorLabel>
                  )}
                </label>
                <input
                  id="password_confirmation"
                  type="password"
                  autoComplete="off"
                  {...register("password_confirmation", {
                    required: "Repetir Password es obligatorio",
                    validate: (value) =>
                      value === password || "Passwords incorrecto",
                  })}
                  className={`w-full placeholder-gray-400 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#656766] focus:border-transparent  "}`}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-300">
              <button
                type="button"
                onClick={() => navigate(AppRoutes.locationsList.route())}
                className="px-6 cursor-pointer py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 cursor-pointer py-3 text-white rounded-xl bg-blue-500 hover:bg-blue-600 transition font-medium"
              >
                Crear Coordinador
              </button>
            </div>
          </form>
        </div>
      </PageContent>
    </PageContainer>
  );
}
