import { AppRoutes } from "../../../app/routes/routes";
import { PageContainer } from "../../../shared/ui/styles/PageContainer";
import { PageHeader } from "../../../shared/ui/styles/PageHeader";
import { PageTitle } from "../../../shared/ui/styles/PageTitle";


export function LocationDetails() {
  return (
    <PageContainer>
      <PageHeader
      goBack={true}
      nameBack="Listado"
      backString={AppRoutes.locationsList.route()}
      >
        <PageTitle>Detalles de Sede</PageTitle>
      </PageHeader>
    </PageContainer>
  )
}
