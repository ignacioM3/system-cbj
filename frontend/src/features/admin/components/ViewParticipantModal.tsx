import { useLocation, useNavigate } from "react-router-dom";
import type { ParticipantWithRelation } from "../../../types/Participant";
import { IoIosEye } from "react-icons/io";
import { MdClose } from "react-icons/md";

interface ViewParticipantModalProps {
  participant?: ParticipantWithRelation;
}

export function ViewParticipantModal({
  participant,
}: ViewParticipantModalProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const viewParticipantId = queryParams.get("viewParticipantId");

  const show = Boolean(viewParticipantId && participant);

  const closeModal = () => {
    navigate(location.pathname, { replace: true });
  };

  if (!show || !participant) return null;

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "No especificada";

    // Evita problemas de zona horaria al mostrar fechas YYYY-MM-DD.
    const value = String(date);
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "No especificada";
    }

    return parsedDate.toLocaleDateString("es-AR");
  };

  const fields = [
    { label: "Nombre", value: participant.firstName },
    { label: "Apellido", value: participant.lastName },
    { label: "DNI", value: participant.documentNumber },
    { label: "Fecha de nacimiento", value: formatDate(participant.birthDate) },
    { label: "Email", value: participant.email || "No especificado" },
    { label: "Celular", value: participant.phone || "No especificado" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#4b4b4b72] p-4"
      onClick={closeModal}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-participant-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-end">
  
          <button
            type="button"
            title="Cerrar"
            aria-label="Cerrar modal"
            onClick={closeModal}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100"
          >
            <MdClose size={22} />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#f3ead0] bg-orange-50 p-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xl font-bold text-orange-600">
            {participant.firstName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-[#5C4630]">
              {participant.firstName} {participant.lastName}
            </p>

            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                participant.isActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {participant.isActive ? "Activo" : "Deshabilitado"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.label}
              className="rounded-xl border border-gray-200 p-3"
            >
              <p className="mb-1 text-xs font-medium uppercase text-gray-500">
                {field.label}
              </p>

              <p className="wrap-break-word font-medium text-gray-800">
                {field.value || "No especificado"}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={closeModal}
            className="cursor-pointer rounded-xl bg-blue-500 px-6 py-2.5 font-medium text-white transition hover:bg-blue-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}