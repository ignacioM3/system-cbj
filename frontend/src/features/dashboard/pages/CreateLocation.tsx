import React from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../../../shared/ui/styles/PageContainer";
import { PageHeader } from "../../../shared/ui/styles/PageHeader";
import { PageTitle } from "../../../shared/ui/styles/PageTitle";
import { PageContent } from "../../../shared/ui/styles/PageContent";
import ErrorLabel from "../../../shared/ui/form/ErrorMessage";
import { useForm } from "react-hook-form";
import { AppRoutes } from "../../../app/routes/routes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLocationApi } from "../../../api/LocationApi";
import { sileo } from "sileo";
import type { CreateLocationDataForm } from "../../../types/Location";

export function CreateLocation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient()

  const initialValues = {
    name: "",
    address: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: initialValues,
  });

  const { mutate } = useMutation({
    mutationFn: createLocationApi,
    onError: (error) => {
      sileo.error({ title: error.message });
    },
    onSuccess: () => {
      sileo.success({title: "Centro creado exitosamente"});
      queryClient.invalidateQueries({ queryKey: ["getAllLocations"] });
      reset();
    },

  });

  const handleCreateLocation = (data: CreateLocationDataForm) =>{
    mutate(data)
  }
  return (
    <PageContainer>
      <PageHeader
        goBack={true}
        nameBack="Listado"
        backString={AppRoutes.locationsList.route()}
      >
        <PageTitle>Crear Centro</PageTitle>
      </PageHeader>
      <PageContent>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-300 max-w-200 mx-auto w-full">
          <form className="space-y-6" onSubmit={handleSubmit(handleCreateLocation)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-md font-medium text-[#5C4630] mb-2 flex items-center gap-1">
                  Nombre de la sede{" "}
                  {errors.name && (
                    <ErrorLabel className="text-[12px]">
                      {errors.name.message}
                    </ErrorLabel>
                  )}
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="off"
                  {...register("name", { required: "El nombre es requerido" })}
                  className={`w-full placeholder-gray-400 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#656766] focus:border-transparent  "}`}
                  placeholder="Ej: CBJ Munro"
                />
              </div>

              <div>
                <label className="text-md font-medium text-[#5C4630] mb-2 flex items-center gap-1">
                  Dirección{" "}
                  {errors.address && (
                    <ErrorLabel className="text-[12px]">
                      {errors.address.message}
                    </ErrorLabel>
                  )}
                </label>
                <input
                  {...register("address", {
                    required: "La dirección es requerida",
                  })}
                  type="text"
                  id="address"
                  placeholder="Ej: Ameghino 4070"
                  className={`w-full placeholder-gray-400 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#656766]  focus:border-transparent "}`}
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
                Crear Centro
              </button>
            </div>
          </form>
        </div>
      </PageContent>
    </PageContainer>
  );
}
