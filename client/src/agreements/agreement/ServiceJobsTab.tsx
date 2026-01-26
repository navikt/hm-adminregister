import { Alert, BodyShort, Button, Loader, Table, TextField, VStack } from "@navikt/ds-react";
import { TabPanel } from "felleskomponenter/styledcomponents/TabPanel";
import { RowBoxTable } from "felleskomponenter/styledcomponents/Table";
import { getServiceJobsForAgreement, updateServiceJob, UpdateServiceJobPayload } from "api/ServiceJobApi";
import { ServiceJobDTO } from "utils/types/response-types";
import { useState } from "react";

interface Props {
  agreementId: string;
}

const ServiceJobsTab = ({ agreementId }: Props) => {
  const { data, isLoading, error, mutate } = getServiceJobsForAgreement(agreementId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftValues, setDraftValues] = useState<Record<string, UpdateServiceJobPayload>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const startEdit = (job: ServiceJobDTO) => {
    setEditingId(job.id);
    setDraftValues((prev) => ({ ...prev, [job.id]: { title: job.title, hmsNr: job.hmsNr } }));
  };

  const cancelEdit = (id: string) => {
    setEditingId((current) => (current === id ? null : current));
  };

  const handleChange = (id: string, field: keyof UpdateServiceJobPayload, value: string) => {
    setDraftValues((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { title: "", hmsNr: "" }),
        [field]: value,
      },
    }));
  };

  const handleSave = async (job: ServiceJobDTO) => {
    const draft = draftValues[job.id];
    if (!draft) return;
    setSavingId(job.id);
    try {
      const updated = await updateServiceJob(job.id, draft);
      await mutate(
        (current) => current?.map((j) => (j.id === job.id ? updated : j)) ?? current,
        false,
      );
      setEditingId(null);
    } finally {
      setSavingId(null);
    }
  };

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
              <Table.HeaderCell scope="col" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.map((job: ServiceJobDTO) => {
              const isEditing = editingId === job.id;
              const draft = draftValues[job.id] ?? { title: job.title, hmsNr: job.hmsNr };
              return (
                <Table.Row key={job.id}>
                  <Table.DataCell style={{ width: "8rem" }}>
                    {isEditing ? (
                      <TextField
                        size="small"
                        value={draft.hmsNr || ""}
                        onChange={(e) => handleChange(job.id, "hmsNr", e.target.value)}
                      />
                    ) : (
                      <BodyShort>{job.hmsNr || "-"}</BodyShort>
                    )}
                  </Table.DataCell>
                  <Table.DataCell>
                    {isEditing ? (
                      <TextField
                        size="small"
                        value={draft.title || ""}
                        onChange={(e) => handleChange(job.id, "title", e.target.value)}
                      />
                    ) : (
                      <BodyShort>{job.title || "Uten tittel"}</BodyShort>
                    )}
                  </Table.DataCell>
                  <Table.DataCell>
                    {isEditing ? (
                      <>
                        <Button
                          size="xsmall"
                          variant="primary"
                          loading={savingId === job.id}
                          onClick={() => handleSave(job)}
                        >
                          Lagre
                        </Button>
                        <Button
                          size="xsmall"
                          variant="tertiary"
                          style={{ marginLeft: "0.5rem" }}
                          onClick={() => cancelEdit(job.id)}
                        >
                          Avbryt
                        </Button>
                      </>
                    ) : (
                      <Button size="xsmall" variant="secondary" onClick={() => startEdit(job)}>
                        Endre
                      </Button>
                    )}
                  </Table.DataCell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </RowBoxTable>
      </VStack>
    </TabPanel>
  );
};

export default ServiceJobsTab;
