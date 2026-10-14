import { useNavigate, useLocation } from "react-router-dom";
import { AppRoutes } from "../../../app/routes/routes";
import { ListAddButton } from "../../../shared/ui/styles/ListAddButton";
import { PageContainer } from "../../../shared/ui/styles/PageContainer";
import { PageHeader } from "../../../shared/ui/styles/PageHeader";
import { PageTitle } from "../../../shared/ui/styles/PageTitle";
import { PageContent } from "../../../shared/ui/styles/PageContent";
import { MdBlock, MdOutlineEdit } from "react-icons/md";
import { Pagination } from "../../../shared/ui/styles/Pagination";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../../shared/ui/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { getAllParticipantsByLocationId } from "../../../api/ParticipantApi";
import type { ParticipantWithRelation } from "../../../types/Participant";
import useAuth from "../../../app/hooks/use-auth";
import { IoIosEye } from "react-icons/io";
import { DisableParticipantModal } from "../components/DisableParticipantModal";
import { ViewParticipantModal } from "../components/ViewParticipantModal";

export function ListParticipant() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const userPerPage = 8;
  const [total, setTotal] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "getAllParticipantsByLocationId",
      currentUser?.locationId,
      currentPage,
    ],
    queryFn: () =>
      getAllParticipantsByLocationId(currentUser?.locationId, currentPage),
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setTotal(data.total);
    }
  }, [data]);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <h1>Error al cargar participantes</h1>;
  if (!data) return null;

  return (
    <PageContainer>
      <PageHeader
        goBack={true}
        nameBack="Inicio"
        backString={AppRoutes.homeAdmin.route()}
      >
        <PageTitle>Lista de Participantes</PageTitle>

        <ListAddButton
          onClick={() =>
            navigate(AppRoutes.createParticipant.route(currentUser?.locationId))
          }
        >
          Agregar Participante
        </ListAddButton>
      </PageHeader>
      <PageContent>
        <div className="bg-white p-6 rounded-2xl shadow border border-[#f3ead0]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#f3ead0] text-[#5C4630] uppercase text-xs">
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Apellido</th>
                  <th className="p-3 hidden md:table-cell">DNI</th>
                  <th className="p-3 hidden md:table-cell">Celular</th>
                  <th className="p-3 hidden md:table-cell">Referente</th>
                  <th className="p-3 hidden md:table-cell">Grupo</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {data.total ? (
                  data.participants.map((row: ParticipantWithRelation) => (
                    <tr
                      key={row.id}
                      className="border-b last:border-none border-[#f3ead0] hover:bg-orange-50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                            {row.firstName.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <p className="font-medium text-[#5C4630]">
                              {row.firstName}
                            </p>
                            {!row.isActive && (
                              <span className="text-xs text-red-400 font-bold">
                                Usuario Deshabilitado
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 md:table-cell text-gray-600">
                        {row.lastName}
                      </td>
                      <td className="p-3 hidden md:table-cell text-gray-600">
                        {row.documentNumber}
                      </td>

                      <td className="p-3 hidden md:table-cell text-gray-600">
                        {row.phone}
                      </td>
                      <td className="p-3 hidden md:table-cell text-gray-600">
                        Vicky
                      </td>
                          <td className="p-3 hidden md:table-cell pl-5 text-gray-600">
                        A
                      </td>

                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="Editar"
                            onClick={() =>
                              navigate(AppRoutes.editParticipant.route(row.id))
                            }
                            className="w-9 h-9 flex cursor-pointer items-center justify-center rounded-lg  bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-all duration-200"
                          >
                            <MdOutlineEdit size={18} />
                          </button>

                          <button
                            title="Deshabilitar"
                            onClick={() =>
                              navigate(
                                location.pathname +
                                  `?disableParticipantId=${row.id}`,
                              )
                            }
                            className={`w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200
                                ${
                                  row.isActive
                                    ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                          >
                            <MdBlock size={18} />
                          </button>

                          <button
                            title="Ver Participante"
                            onClick={() =>
                              navigate(
                                `${location.pathname}?viewParticipantId=${row.id}`,
                              )
                            }
                            className="h-9 px-3 rounded-lg cursor-pointer bg-slate-200 text-slate-600 hover:bg-slate-300 transition-all duration-200 text-sm font-medium"
                          >
                            <IoIosEye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      No hay participantes creados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINACIÓN */}
        <div className="mt-6">
          <Pagination
            total={total}
            perPage={userPerPage}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
        <DisableParticipantModal />
        <ViewParticipantModal
          participant={data.participants.find(
            (participant: ParticipantWithRelation) =>
              participant.id ===
              new URLSearchParams(location.search).get("viewParticipantId"),
          )}
        />
      </PageContent>
    </PageContainer>
  );
}
