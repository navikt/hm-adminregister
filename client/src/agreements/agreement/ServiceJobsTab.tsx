import { Alert, BodyShort, Loader, Table, VStack } from "@navikt/ds-react";
import { TabPanel } from "felleskomponenter/styledcomponents/TabPanel";
import { RowBoxTable } from "felleskomponenter/styledcomponents/Table";
import { getServiceJobsForAgreement } from "api/ServiceJobApi";
import { ServiceJobDTO } from "utils/types/response-types";

interface Props {
  agreementId: string;
}

const ServiceJobsTab = ({ agreementId }: Props) => {
  const { data, isLoading, error } = getServiceJobsForAgreement(agreementId);

  if (isLoading) {
    return (
      <TabPanel value="servicejobs">
        <Loader size="large" />
      </TabPanel>
    );
  }

  if (error) {
    return (
      <TabPanel value="servicejobs">
        <Alert variant="error">Kunne ikke hente tjenester.</Alert>
      </TabPanel>
    );
  }

  if (!data || data.length === 0) {
    return (
      <TabPanel value="servicejobs">
        <Alert variant="info">Ingen tjenester knyttet til denne rammeavtalen.</Alert>
      </TabPanel>
    );
  }

  return (
    <TabPanel value="servicejobs">
      <VStack gap="4">
        <RowBoxTable size="small">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell scope="col" style={{ width: "8rem" }}>
                HMS-nummer
              </Table.HeaderCell>
              <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.map((job: ServiceJobDTO) => (
              <Table.Row key={job.id}>
                <Table.DataCell style={{ width: "8rem" }}>
                  <BodyShort>{job.hmsNr || "-"}</BodyShort>
                </Table.DataCell>
                <Table.DataCell>
                  <BodyShort>{job.title || "Uten tittel"}</BodyShort>
                </Table.DataCell>
              </Table.Row>
            ))}
          </Table.Body>
        </RowBoxTable>
      </VStack>
    </TabPanel>
  );
};

export default ServiceJobsTab;
