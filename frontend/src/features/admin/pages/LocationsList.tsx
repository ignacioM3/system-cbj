import { AppRoutes } from "../../../app/routes/routes";
import { PageContainer } from "../../../shared/ui/styles/PageContainer";
import { PageContent } from "../../../shared/ui/styles/PageContent";
import { PageHeader } from "../../../shared/ui/styles/PageHeader";
import { PageTitle } from "../../../shared/ui/styles/PageTitle";
import { useQuery } from "@tanstack/react-query";
import {getAllLocationsActive} from "../../../api/LocationApi"
import LoadingSpinner from "../../../shared/ui/LoadingSpinner";
import { ListAddButton } from "../../../shared/ui/styles/ListAddButton";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { MetricCard } from "../../../shared/MetricCard";
import { SearchBar } from "../../../shared/ui/styles/SearchBar";
import { BiBuildings } from "react-icons/bi";

export function LocationsList() {
const navigate = useNavigate()

 const [search, setSearch] = useState("");
  const normalizeText = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["getAllLocations"],
    queryFn: () => getAllLocationsActive(),
    retry: false,
  });
  
  
  const filteredLocations = useMemo(() => {
    if (!data?.locations) return [];

    if (!search.trim()) {
      return data.locations;
    }

    const normalizedSearch = normalizeText(search);

    return data.locations.filter((location) =>
      normalizeText(location.name).includes(normalizedSearch) ||
      normalizeText(location.address).includes(normalizedSearch)
    );
  }, [data?.locations, search]);



 if (isLoading) return <LoadingSpinner />;
   if (isError || !data) {
    return <div>Error al cargar los centros</div>;
  }

if(!data) return null

  return (
    <PageContainer>
      <PageHeader
        goBack={true}
        nameBack="Inicio"
        backString={AppRoutes.homeAdmin.route()}
      >
             <PageTitle>Lista de Centros</PageTitle>

        <ListAddButton
          onClick={() => navigate(AppRoutes.createLocation.route())}
        >
          Agregar Centro
        </ListAddButton>
      </PageHeader>
      <PageContent>

          <div className="space-y-8">

          {/* 📊 MÉTRICAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            <MetricCard
              title="Centros Activos"
              value={data.total}
              color="text-blue-600"
            />

            <MetricCard
              title="Jovenes Inscriptos"
              value={500}
              color="text-green-600"
            />

            <MetricCard
              title="Equipos activos"
              value={14}
              color="text-orange-600"
            />

          </div>

          {/* SEARCH */}
          <div className="flex justify-end">
            <SearchBar
              value={search}
              onChange={setSearch}
            />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow border border-[#f3ead0]">

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {filteredLocations.length > 0 ? (
                filteredLocations.map((location) => (

                    <div
                      key={location.id}
                      onClick={() => navigate("")}
                      className="
                        cursor-pointer
                        p-6
                        rounded-xl
                        border border-[#f3ead0]
                        bg-gray-50
                        hover:bg-orange-50
                        hover:shadow-md
                        transition-all
                        duration-200
                        group
                      "
                    >

                      {/* ICON */}
                      <div className="text-3xl text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                        <BiBuildings />
                      </div>

                      {/* NAME */}
                      <h3 className="font-bold text-[#5C4630] text-lg">
                        {location.name}
                      </h3>

                      {/* LOCATION */}
                      <p className="text-sm text-gray-500">
                        {location.address}
                      </p>

                      {/* STATS */}
                      <div className="mt-4 space-y-1 text-sm">

                        <p>
                          <span className="font-semibold">
                            Equipos:
                          </span>{" "}
                          8
                        </p>

                        <p>
                          <span className="font-semibold">
                            Jovenes Inscriptos:
                          </span>{" "}
                          300
                        </p>

                      </div>
                    </div>
                )
              )) : (
                <div className="col-span-full text-center text-gray-500 py-10">
                  {search
                    ? `No hay resultados para "${search}"`
                    : "No hay sucursales registradas"}
                </div>
              )}

            </div>

          </div>

        </div>

      </PageContent>
    </PageContainer>
  );
}
