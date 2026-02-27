import { Alert, BodyShort, Button, Loader, Table, TextField, VStack, Dropdown, HStack } from "@navikt/ds-react";
import { TabPanel } from "felleskomponenter/styledcomponents/TabPanel";
import { RowBoxTable } from "felleskomponenter/styledcomponents/Table";
import {
  deleteServiceJob,
  getServiceJobsForAgreement,
  updateServiceJob,
  UpdateServiceJobPayload,
} from "api/ServiceJobApi";
import { ServiceJobDTO } from "utils/types/response-types";
import { useState } from "react";
import { MenuElipsisVerticalIcon } from "@navikt/aksel-icons";
import ConfirmModal from "felleskomponenter/ConfirmModal";

interface Props {
  agreementId: string;
}

const ServiceJobsTab = ({ agreementId }: Props) => {
  const { data, isLoading, error, mutate } = getServiceJobsForAgreement(agreementId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftValues, setDraftValues] = useState<Record<string, UpdateServiceJobPayload>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isSletteModalOpen, setIsSletteModalOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      await mutate((current) => current?.map((j) => (j.id === job.id ? updated : j)) ?? current, false);
      setEditingId(null);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string | null) => {
    if (!id) {
      return;
    }

    try {
      await deleteServiceJob(id);
      await mutate((current) => current?.filter((j) => j.id !== id) ?? current, false);
    } finally {
      setIsSletteModalOpen(false);
      setDeletingId(null);
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
      <ConfirmModal
        title="Vil du slette denne tjenesten?"
        onClick={() => handleDelete(deletingId)}
        isModalOpen={isSletteModalOpen}
        onClose={() => {
          setIsSletteModalOpen(false);
          setDeletingId(null);
        }}
        confirmButtonText="Slett"
      />
      <VStack gap="space-4">
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
                <Table.Row key={job.id} className="no-hover-row">
                  <Table.DataCell style={{ width: "8rem", paddingLeft: "1rem" }}>
                    {isEditing ? (
                      <TextField
                        size="small"
                        label=""
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
                        label=""
                        size="small"
                        value={draft.title || ""}
                        onChange={(e) => handleChange(job.id, "title", e.target.value)}
                      />
                    ) : (
                      <BodyShort>{job.title || "Uten tittel"}</BodyShort>
                    )}
                  </Table.DataCell>
                  <Table.DataCell align="right">
                    {isEditing ? (
                      <HStack gap="space-2" justify="center">
                        <Button
                          size="xsmall"
                          variant="primary"
                          loading={savingId === job.id}
                          onClick={() => handleSave(job)}
                        >
                          Lagre
                        </Button>
                        <Button size="xsmall" variant="tertiary" onClick={() => cancelEdit(job.id)}>
                          Avbryt
                        </Button>
                      </HStack>
                    ) : (
                      <Dropdown>
                        <Button
                          style={{ marginLeft: "auto" }}
                          variant="tertiary"
                          icon={<MenuElipsisVerticalIcon title="Rediger" fontSize="1.5rem" />}
                          as={Dropdown.Toggle}
                        ></Button>
                        <Dropdown.Menu>
                          <Dropdown.Menu.List>
                            <Dropdown.Menu.List.Item onClick={() => startEdit(job)}>Endre</Dropdown.Menu.List.Item>
                            <Dropdown.Menu.List.Item
                              onClick={() => {
                                setIsSletteModalOpen(true);
                                setDeletingId(job.id);
                              }}
                            >
                              Slett
                            </Dropdown.Menu.List.Item>
                          </Dropdown.Menu.List>
                        </Dropdown.Menu>
                      </Dropdown>
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
