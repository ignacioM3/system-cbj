import { useEffect, useMemo, useState } from "react";
import {
  BiSearch,
  BiCheck,
  BiRightArrowAlt,
} from "react-icons/bi";

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

  const youngPeople = useMemo<YoungPerson[]>(() => {
    return [
      { id: "1", firstName: "Benjamin", lastName: "Izaguirre" },
      { id: "2", firstName: "María", lastName: "González" },
      { id: "3", firstName: "Carlos", lastName: "Rodríguez" },
      { id: "4", firstName: "Lucía", lastName: "Fernández" },
      { id: "5", firstName: "Sofía", lastName: "López" },
      { id: "6", firstName: "Mateo", lastName: "Martínez" },
      { id: "7", firstName: "Valentina", lastName: "Gómez" },
      { id: "8", firstName: "Diego", lastName: "Díaz" },
      { id: "9", firstName: "Camila", lastName: "Torres" },
      { id: "10", firstName: "Sebastián", lastName: "Ramírez" },
    ];
  }, []);

  const locationName = "CBJ Martelli";

  /*
   * Fecha actual en formato YYYY-MM-DD.
   *
   * Usamos la fecha local del navegador para que el cambio
   * de día respete la zona horaria del usuario.
   */
  const getToday = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /*
   * Al cargar la página:
   *
   * 1. Buscamos la asistencia guardada.
   * 2. Comprobamos que sea del día actual.
   * 3. Si es de hoy, recuperamos la persona.
   * 4. Si es de otro día, eliminamos el registro viejo.
   */
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

  /*
   * FORMULARIO DE ASISTENCIA
   */
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