import { useQuery } from "@tanstack/react-query";
import { getLocationById } from "../../../api/LocationApi";
import { AppRoutes } from "../../../app/routes/routes";
import { PageContainer } from "../../../shared/ui/styles/PageContainer";
import { PageContent } from "../../../shared/ui/styles/PageContent";
import { PageHeader } from "../../../shared/ui/styles/PageHeader";
import { PageTitle } from "../../../shared/ui/styles/PageTitle";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../../shared/ui/LoadingSpinner";
import { getEquipment } from "../../../lib/getUsers";
import {
  BiBuildings,
  BiMap,
  BiCheckCircle,
  BiGroup,
  BiQr,
} from "react-icons/bi";

import { MetricCard } from "../../../shared/MetricCard";
import {
  AttendanceQRCode,
  type AttendanceQRCodeRef,
} from "../components/AttendanceQRCode";
import { IoMdEye } from "react-icons/io";
import { UserRole } from "../../../types/user-role";
import { useRef } from "react";
import { EditLocationNameModal } from "../components/EditLocationNameModal";

export function LocationDetails() {
  const { id } = useParams();
  const qrRef = useRef<AttendanceQRCodeRef>(null);
  const navigate = useNavigate();
  const locationReact = useLocation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["locationDetails", id],
    queryFn: () => getLocationById(id!),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-full mt-10 font-bold text-red-500 flex items-center justify-center">
        <p>Error al cargar los detalles</p>
      </div>
    );
  }

  const location = data.location;

  const equipment = getEquipment(location.users);

  return (
    <PageContainer>
      <PageHeader
        goBack={true}
        nameBack="Listado"
        backString={AppRoutes.locationsList.route()}
      >
        <PageTitle>Detalles de Sede</PageTitle>
      </PageHeader>

      <PageContent>
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow border border-[#f3ead0] p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-3xl text-purple-400">
                  <BiBuildings />
                </div>

                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold text-[#5C4630]">
                      {location.name}
                    </h2>

                    <span
                      className="
                        flex
                        items-center
                        gap-1
                        text-sm
                        px-3
                        py-1
                        rounded-full
                        bg-green-50
                        text-green-600
                        font-medium
                      "
                    >
                      <BiCheckCircle />
                      Activa
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500 mt-2">
                    <BiMap />

                    <p>{location.address}</p>
                  </div>
                </div>
              </div>

              <button
                className="
                  px-5
                  py-2.5
                  rounded-xl
                  bg-[#5C4630]
                  text-white
                  hover:opacity-90
                  transition
                  cursor-pointer
                "
                onClick={() =>
                  navigate(
                    locationReact.pathname +
                      `?editNameLocationId=${location.id}`,
                  )
                }
              >
                Editar Nombre
              </button>
            </div>
          </div>

          {/* =========================
              METRICS
          ========================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard
              title="Equipos"
              value={equipment.length}
              color="text-purple-500"
            />

            <MetricCard
              title="Jóvenes inscriptos"
              value={equipment.length}
              color="text-green-600"
            />

            <MetricCard
              title="Asistencias hoy"
              value={0}
              color="text-blue-600"
            />
          </div>

          {/* =========================
              MANAGEMENT CARDS
          ========================== */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Equipo */}

            <div className="bg-white rounded-2xl shadow border border-[#f3ead0] p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-2xl text-purple-400">
                    <BiGroup />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#5C4630] text-lg">
                      Equipos
                    </h3>

                    <p className="text-sm text-gray-500">
                      Equipos pertenecientes a esta sede
                    </p>
                  </div>
                </div>

                <button className="text-sm font-medium text-purple-500 hover:text-purple-700 transition cursor-pointer">
                  Ver todos
                </button>
              </div>

              {/* TEAM LIST */}

              <div className="space-y-3 max-h-75 overflow-y-auto pr-2">
                {equipment.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-[#f3ead0] bg-gray-50 hover:bg-purple-50 hover:shadow-sm transition-all cursor-pointer"
                  >
                    {/* LEFT */}

                    <div className="flex items-center gap-4">
                      <div className=" w-11 h-11 rounded-xl bg-purple-100 text-purple-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        <BiGroup />
                      </div>

                      <div>
                        <h4 className="font-semibold text-[#5C4630]">
                          {team.firstName} {team.lastName}
                        </h4>
                      </div>
                    </div>

                    {/* RIGHT */}

                    <div className="text-gray-400 group-hover:text-purple-500 transition">
                      <IoMdEye className="text-2xl" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QR */}

            <div className="bg-white rounded-2xl shadow border border-[#f3ead0] p-6">
              <div className="flex items-center gap-3 mb-6 justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl text-purple-400">
                    <BiQr />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#5C4630] text-lg">
                      Código QR
                    </h3>

                    <p className="text-sm text-gray-500">
                      Utilizado para registrar asistencia
                    </p>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => qrRef.current?.download()}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition cursor-pointer"
                  >
                    Descargar
                  </button>
                </div>
              </div>

              <div
                className="
                  border-2
                  border-dashed
                  border-[#f3ead0]
                  rounded-xl
                  p-10
                  text-center
                  text-gray-400
                  max-h-75
                  h-full
                  flex
                  flex-col
                  items-center
                  justify-center
                "
              >
                <AttendanceQRCode ref={qrRef} locationId={location.id} />

                <p className="mt-4 text-sm text-gray-500">
                  Escaneá este código para registrar asistencia
                </p>
              </div>
            </div>
          </div>
        </div>
        <EditLocationNameModal />
      </PageContent>
    </PageContainer>
  );
}
