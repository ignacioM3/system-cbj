import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { sileo } from "sileo";
import { editLocationNameApi } from "../../../api/LocationApi";
import { useForm } from "react-hook-form";
import { FaRegBuilding } from "react-icons/fa6";
import { id } from "zod/v4/locales/index.js";

export function EditLocationNameModal() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const queryParams = new URLSearchParams(location.search);
  const editLocationId = queryParams.get("editNameLocationId")!;
  const show = editLocationId ? true : false;

  const { register, handleSubmit, formState: { errors } } = useForm({
  defaultValues: {
    name: "",
  }
});


const { mutate } = useMutation({
  mutationFn: editLocationNameApi,

  retry: false,

  onError: (error) => {
    sileo.error({
      title: error.message,
    });
  },

  onSuccess: () => {
    sileo.success({
      title: "Nombre cambiado correctamente",
    });

    queryClient.invalidateQueries({
      queryKey: ["locationDetails", editLocationId],
    });

    navigate(location.pathname, {
      replace: true,
    });
  },
});


const handleSubmitForm = ({ name }: { name: string }) => {
  mutate({
    locationId: editLocationId,
    name,
  });
};

  return (
    <div
      className={`${show ? "fixed" : "hidden"} bg-[#4b4b4b72] h-screen left-0 bottom-0 right-0 `}
      onClick={() => navigate(location.pathname, { replace: true })}
    >
      <form 
        className="w-full h-full flex items-center justify-center"
        onSubmit={handleSubmit(handleSubmitForm)}
        >
        <div
          className="bg-white w-85 rounded-xl shadow-xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center mb-4">
            <div
              className="w-12 h-12 flex items-center justify-center
                      rounded-full bg-red-100 text-red-600 text-xl"
            >
              <FaRegBuilding className="text-3xl" />
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-800 text-center mb-2">
            Cambiar nombre de la sede
          </h2>

          <div className="mb-2.5">
            <input
              {...register("name", {
                required: "El nombre es requirido",
              })}
              type="text"
              id="name"
              placeholder="Ej: Sede villa martelli"
              className={`w-full placeholder-gray-400 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#656766]  focus:border-transparent "}`}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(location.pathname, { replace: true })}
              className="w-full py-2 rounded-lg border border-gray-300
                   text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-blue-500 text-white
                   hover:bg-blue-600 shadow-md transition cursor-pointer"
            >
              Cambiar Nombre
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
