import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { CiWarning } from "react-icons/ci";
import { deleteUserCoordinator } from "../../../api/UsersApi";
import { sileo } from "sileo";



export function DeleteUserModal() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const queryParams = new URLSearchParams(location.search);
    const deleteUserId = queryParams.get('deleteUser')!
    const show = deleteUserId ? true : false;

    const { mutate } = useMutation({
        mutationFn: deleteUserCoordinator,
        retry: false,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: (data) => {
            sileo.success({title: data})
            queryClient.invalidateQueries({ queryKey: ['gettAllUserCoordinator'] })
            navigate(location.pathname, { replace: true })
        }
    })

    const handleSubmit = () => mutate(deleteUserId)

    return (
        <div
            className={`${show ? 'fixed' : 'hidden'} bg-[#4b4b4b72] h-screen left-0 bottom-0 right-0 `}
            onClick={() => navigate(location.pathname, { replace: true })}
        >
             <div className='w-full h-full flex items-center justify-center'>

           
            <div
                className="bg-white w-85 rounded-xl shadow-xl p-6"
                onClick={(e) => e.stopPropagation()}
               
            >
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 flex items-center justify-center
                      rounded-full bg-red-100 text-red-600 text-xl">
                        <CiWarning  className="text-3xl"/>
                    </div>
                </div>

                <h2 className="text-lg font-bold text-gray-800 text-center mb-2">
                    ¿Desea Eliminar este Usuario?
                </h2>

                <p className="text-sm text-gray-500 text-center mb-6">
                    Se eliminara de forma permanente el usuario
                </p>

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
                        type="button"
                        onClick={handleSubmit}
                        className="w-full py-2 rounded-lg bg-red-500 text-white
                   hover:bg-red-600 shadow-md transition cursor-pointer"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
              </div>
        </div>
    );
}
