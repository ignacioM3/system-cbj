import { useEffect, useMemo, useState } from "react";
import {
  BiSearch,
  BiCheck,
  BiRightArrowAlt,
} from "react-icons/bi";
import { useQuery } from "@tanstack/react-query";
import { getAllParticipantsBYLocationIdApi } from "../../../api/ParticipantApi";
import { useParams } from "react-router-dom";

interface YoungPerson {
  id: string;
  firstName: string;
  lastName: string;
}

interface AttendanceRecord {
  personId: string;
  date: string;
  confirmedAt: string;
}

const ATTENDANCE_STORAGE_KEY = "cbj_attendance";

export function AttendancePage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

const { id } = useParams();
const locationId = id ?? null;

const {
  data,
  isLoading,
  isError,
} = useQuery({
  queryKey: ["participantsByLocation", locationId],
  queryFn: () =>
    getAllParticipantsBYLocationIdApi(locationId!),
  enabled: !!locationId,
  retry: false,
})

const participants = data?.participants ?? [];
const locationName = data?.locationName ?? "Sede";

const youngPeople = useMemo<YoungPerson[]>(() => {
  return (participants ?? []).map((participant) => ({
    id: participant.id,
    firstName: participant.firstName,
    lastName: participant.lastName,
  }));
}, [participants]);

  const getToday = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const storedAttendance = localStorage.getItem(
      ATTENDANCE_STORAGE_KEY
    );

    if (!storedAttendance) return;

    try {
      const attendance: AttendanceRecord =
        JSON.parse(storedAttendance);

      const today = getToday();

      if (attendance.date === today) {
        setSelectedId(attendance.personId);
        setIsConfirmed(true);
      } else {
        // La asistencia es de otro día.
        localStorage.removeItem(ATTENDANCE_STORAGE_KEY);
      }
    } catch (error) {
      console.error(
        "Error leyendo la asistencia guardada:",
        error
      );

      localStorage.removeItem(ATTENDANCE_STORAGE_KEY);
    }
  }, []);

  const filteredPeople = useMemo(() => {
    const normalizedSearch = search
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return youngPeople.filter((person) => {
      const fullName = `${person.firstName} ${person.lastName}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      return fullName.includes(normalizedSearch);
    });
  }, [search, youngPeople]);

  const selectedPerson = youngPeople.find(
    (person) => person.id === selectedId
  );

  /*
   * Confirmar asistencia
   */
  const handleConfirm = () => {
    if (!selectedPerson || isConfirmed) return;

    const attendance: AttendanceRecord = {
      personId: selectedPerson.id,
      date: getToday(),
      confirmedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      ATTENDANCE_STORAGE_KEY,
      JSON.stringify(attendance)
    );

    setIsConfirmed(true);
  };

  /*
   * Si ya confirmó la asistencia,
   * mostramos la pantalla de confirmación.
   */
  if (isConfirmed && selectedPerson) {
    return (
      <main className="min-h-screen bg-linear-to-br from-purple-700 via-purple-600 to-violet-600 px-4 flex items-center justify-center">
        <section
          className="
            w-full
            max-w-130
            bg-white
            rounded-3xl
            shadow-2xl
            px-5
            py-10
            sm:px-10
            sm:py-12
            text-center
          "
        >
          {/* SUCCESS ICON */}
          <div
            className="
              mx-auto
              mb-6
              w-20
              h-20
              rounded-full
              bg-green-100
              flex
              items-center
              justify-center
            "
          >
            <BiCheck className="text-5xl text-green-600" />
          </div>

          {/* LOCATION */}
          <p
            className="
              text-sm
              sm:text-base
              font-bold
              text-violet-600
              tracking-wide
              uppercase
            "
          >
            {locationName}
          </p>

          {/* TITLE */}
          <h1
            className="
              mt-3
              text-3xl
              sm:text-4xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            ¡Asistencia confirmada!
          </h1>

          {/* DESCRIPTION */}
          <p
            className="
              mt-4
              text-sm
              sm:text-base
              leading-6
              text-slate-500
            "
          >
            Tu asistencia fue registrada correctamente.
          </p>

          {/* PERSON */}
          <div
            className="
              mt-7
              rounded-xl
              bg-violet-50
              border
              border-violet-100
              p-4
            "
          >
            <p className="text-sm text-slate-500">
              Joven
            </p>

            <p
              className="
                mt-1
                text-lg
                font-bold
                text-slate-900
              "
            >
              {selectedPerson.firstName}{" "}
              {selectedPerson.lastName}
            </p>
          </div>

          {/* DATE */}
          <p className="mt-6 text-xs text-slate-400">
            Asistencia registrada hoy.
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Ya no podés volver a registrar tu asistencia.
          </p>
        </section>
      </main>
    );
  }

if (!locationId) {
  return <p>No se especificó la sede.</p>;
}

if (isLoading) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-slate-600">
        Cargando participantes...
      </p>
    </main>
  );
}

if (isError) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-red-600">
        Error al cargar los participantes.
      </p>
    </main>
  );
}

  return (
    <main className="min-h-screen bg-linear-to-br from-purple-700 via-purple-600 to-violet-600 px-4 flex items-center justify-center">
      <section
        className="
          w-full
          max-w-130
          bg-white
          rounded-3xl
          shadow-2xl
          px-5
          py-7
          sm:px-10
          sm:py-10
        "
      >
        {/* HEADER */}
        <header className="mb-6 sm:mb-7">
          <p
            className="
              text-sm
              sm:text-base
              font-bold
              text-violet-600
              tracking-wide
              uppercase
            "
          >
            Asistencia del día

            <span className="mx-2">
              •
            </span>

            {locationName}
          </p>

          <h1
            className="
              mt-3
              text-3xl
              sm:text-4xl
              font-bold
              tracking-tight
              text-slate-900
            "
          >
            Marcá tu asistencia
          </h1>

          <p
            className="
              mt-3
              text-sm
              sm:text-base
              leading-6
              text-slate-500
            "
          >
            Buscá tu nombre en la lista de jóvenes,{" "}
            <br />
            seleccionalo y confirmá tu ingreso a la sede.
          </p>
        </header>

        {/* SEARCH */}
        <div className="relative mb-5">
          <BiSearch
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-xl
              text-slate-500
            "
          />

          <input
            type="text"
            placeholder="Buscá tu nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              h-13
              sm:h-14
              rounded-xl
              border
              border-violet-200
              bg-violet-50/60
              pl-12
              pr-4
              text-sm
              sm:text-base
              text-slate-800
              placeholder:text-slate-400
              outline-none
              transition
              focus:border-violet-500
              focus:ring-2
              focus:ring-violet-100
            "
          />
        </div>

        {/* PEOPLE LIST */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {filteredPeople.length > 0 ? (
            filteredPeople.map((person) => {
              const isSelected =
                selectedId === person.id;

              const initials = `${person.firstName[0]}${person.lastName[0]}`;

              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() =>
                    setSelectedId(person.id)
                  }
                  className={`
                    w-full
                    min-h-17
                    sm:min-h-18
                    px-4
                    rounded-xl
                    border
                    flex
                    items-center
                    gap-4
                    text-left
                    transition-all
                    duration-200
                    cursor-pointer

                    ${
                      isSelected
                        ? `
                          bg-violet-600
                          border-violet-600
                          text-white
                          shadow-lg
                          shadow-violet-200
                        `
                        : `
                          bg-white
                          border-violet-200
                          text-slate-800
                          hover:bg-violet-50
                          hover:border-violet-300
                        `
                    }
                  `}
                >
                  {/* INITIALS */}
                  <div
                    className={`
                      w-10
                      h-10
                      shrink-0
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      font-bold
                      text-sm

                      ${
                        isSelected
                          ? "bg-white/15 text-white"
                          : "bg-gray-100 text-slate-700"
                      }
                    `}
                  >
                    {initials.toUpperCase()}
                  </div>

                  {/* NAME */}
                  <span
                    className="
                      flex-1
                      font-semibold
                      text-sm
                      sm:text-base
                      truncate
                    "
                  >
                    {person.firstName}{" "}
                    {person.lastName}
                  </span>

                  {/* CHECK */}
                  {isSelected && (
                    <BiCheck className="text-2xl shrink-0" />
                  )}
                </button>
              );
            })
          ) : (
            <div
              className="
                py-8
                text-center
                text-sm
                text-slate-500
                border
                border-dashed
                border-violet-200
                rounded-xl
              "
            >
              No encontramos ningún joven con ese nombre.
            </div>
          )}
        </div>

        {/* CONFIRM */}
        <button
          type="button"
          disabled={!selectedId}
          onClick={handleConfirm}
          className="
            mt-5
            w-full
            h-14
            rounded-xl
            flex
            items-center
            justify-center
            gap-2
            font-bold
            text-sm
            sm:text-base
            transition-all
            duration-200

            bg-violet-600
            text-white

            hover:bg-violet-700
            active:scale-[0.99]

            disabled:bg-slate-200
            disabled:text-slate-400
            disabled:cursor-not-allowed
            disabled:hover:bg-slate-200
          "
        >
          Confirmar asistencia

          <BiRightArrowAlt className="text-2xl" />
        </button>
      </section>
    </main>
  );
}