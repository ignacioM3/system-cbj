import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import type { UserLoginForm } from "../../../types/User";
import { MdOutlineLock } from "react-icons/md";
import ErrorMessage from "../../../shared/ui/form/ErrorMessage";
import { FaRegUser } from "react-icons/fa6";
import useAuth from "../../../app/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { authLogin } from "../../../api/AuthApi";
import { sileo } from "sileo";
import { AppRoutes } from "../../../app/routes/routes";

export function Login() {
  const navigate = useNavigate();
  const { setCurrentUser, currentUser } = useAuth();

  const initialValues: UserLoginForm = {
    email: "",
    password: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: UserLoginForm) =>
    authLogin(formData, setCurrentUser),
    onError: (error) => {
      sileo.error({
        title: error.message,
        duration: 3000,
        description: (
          <div className="flex flex-col">
            <span className="text-center">Contraseña o email incorrecto.</span>
          </div>
        ),
      });
    },
    onSuccess: (user) => {
      sileo.success({
        title: `¡Bienvenido! ${user?.firstName}`,
        description: (
          <div className="flex flex-col">
            <span className="text-center">Has iniciado sesión correctamente</span>
          </div>
        ),
        duration: 2000,
      });
      navigate(AppRoutes.home.route());
    },
  });

  const handleLogin = (data: UserLoginForm) => mutate(data);

  if (currentUser) return <Navigate to={AppRoutes.homeAdmin.route()} />;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl border border-[#f3ead0] p-8">
        <div className="text-center mb-8">
          <h2 className="text-5xl text-blue-600 font-lilita">CBJ</h2>
          <p className="text-blue-400 text-sm mt-2 font-semibold">
            Centro Barrial de Juventud
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(handleLogin)}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Email</label>

            <div className="relative">
              <FaRegUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="email"
                placeholder="tu@email.com"
                {...register("email", {
                  required: "El email es obligatorio",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Email no válido",
                  },
                })}
                className="w-full pl-10 pr-4 py-3 border border-[#f3ead0] rounded-xl focus:outline-none focus:ring-2 focus:ring-cbj focus:border-cbj transition"
              />
            </div>

            {errors.email && (
              <ErrorMessage bar={false}>{errors.email.message}</ErrorMessage>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Contraseña
            </label>

            <div className="relative">
              <MdOutlineLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="password"
                placeholder="••••••••"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                })}
                className="w-full pl-10 pr-4 py-3 border border-[#f3ead0] rounded-xl focus:outline-none focus:ring-2 focus:ring-cbj focus:border-cbj transition"
              />
            </div>

            {errors.password && (
              <ErrorMessage bar={false}>{errors.password.message}</ErrorMessage>
            )}
          </div>

          {/* Forgot password */}
          <div className="text-right text-sm">
            <button
              type="button"
              className="text-blue-400 cursor-pointer hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-cbj cursor-pointer text-white font-semibold transition shadow-md disabled:opacity-50"
          >
            {isPending ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
