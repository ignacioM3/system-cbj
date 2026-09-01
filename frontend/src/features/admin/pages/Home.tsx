import { PageContainer } from "../../../shared/ui/styles/PageContainer";
import { PageContent } from "../../../shared/ui/styles/PageContent";
import { PageHeader } from "../../../shared/ui/styles/PageHeader";
import { PageTitle } from "../../../shared/ui/styles/PageTitle";

export function Home() {
  return (
     <PageContainer>
      <PageHeader>
        <PageTitle className="text-center">Bienvenido al sistema de administración - <span className="text-blue-400 font-lilita">CBJ</span></PageTitle>
      </PageHeader>
      <PageContent>
        <div className="text-center my-4">
          <p className="md:text-xl">Aca Podras administrar <span className="text-gray-500 font-bold">Equipos</span>, <span className="text-gray-500 font-bold">Asistencias</span> y <span className="text-gray-500 font-bold">Talleres</span></p>
        </div>


      </PageContent>
    </PageContainer>
  )
}
