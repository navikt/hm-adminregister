import { Button, Checkbox, Modal, Table, VStack } from "@navikt/ds-react";
import React, { useState } from "react";
import { ProductAgreementRegistrationDTO } from "utils/types/response-types";
import { activateProductsFromAgreement, deleteProductsFromAgreement } from "api/AgreementProductApi";
import { useErrorStore } from "utils/store/useErrorStore";
import Content from "felleskomponenter/styledcomponents/Content";

interface Props {
  modalIsOpen: boolean;
  setModalIsOpen: (open: boolean) => void;
  variants: ProductAgreementRegistrationDTO[];
  mutateProductAgreements: () => void;
}

const EditProducstVariantsModal = ({ modalIsOpen, setModalIsOpen, variants, mutateProductAgreements }: Props) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const { setGlobalError } = useErrorStore();

  const hasActiveVariant = variants.some((variant) => variant.status === "ACTIVE");
  const hasActiveSelected = variants
    .filter((variant) => selectedRows.includes(variant.id!))
    .some((variant) => variant.status === "ACTIVE");
  const hasInactiveVariant = variants.some((variant) => variant.status === "INACTIVE");
  const hasInactiveSelected = variants
    .filter((variant) => selectedRows.includes(variant.id!))
    .some((variant) => variant.status === "INACTIVE");

  const toggleSelectedRow = (value: string) =>
    setSelectedRows((list: string[]): string[] =>
      list.includes(value) ? list.filter((id: string) => id !== value) : [...list, value],
    );

  const handleFjernValgteProdukter = (selectedRows: string[]) => {
    deleteProductsFromAgreement(selectedRows)
      .then(() => {
        mutateProductAgreements();
        setSelectedRows([]);
      })
      .catch((error) => {
        setGlobalError(error.message);
      });
  };

  const handleGjenaktiverValgteProdukter = (selectedRows: string[]) => {
    activateProductsFromAgreement(selectedRows)
      .then(() => {
        mutateProductAgreements();
        setSelectedRows([]);
      })
      .catch((error) => {
        setGlobalError(error.message);
      });
  };

  return (
    <Modal
      open={modalIsOpen}
      header={{
        heading: `Produktvarianter på avtalen`,
        closeButton: false,
        size: "small",
      }}
      onClose={() => setModalIsOpen(false)}
    >
      <Modal.Body>
        <Content>
          {variants.length > 0 && (
            <VStack gap="2" style={{ width: "100%" }}>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Lev-artnr.</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Status</Table.HeaderCell>
                    <Table.DataCell>
                      <Checkbox
                        checked={selectedRows.length === variants.length}
                        onChange={() => {
                          selectedRows.length ? setSelectedRows([]) : setSelectedRows(variants.map(({ id }) => id!));
                        }}
                        hideLabel
                      >
                        Velg alle rader
                      </Checkbox>
                    </Table.DataCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {variants.map((variant, i) => {
                    return (
                      <Table.Row key={variant.id}>
                        <Table.DataCell>{variant.articleName}</Table.DataCell>
                        <Table.DataCell>{variant.supplierRef}</Table.DataCell>
                        <Table.DataCell>{variant.status === "ACTIVE" ? "Aktiv" : "Inaktiv"}</Table.DataCell>
                        <Table.DataCell>
                          <Checkbox
                            hideLabel
                            checked={selectedRows.includes(variant.id!)}
                            onChange={() => {
                              toggleSelectedRow(variant.id!);
                            }}
                            aria-labelledby={`id-${variant.id}`}
                          >
                            {" "}
                          </Checkbox>
                        </Table.DataCell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            </VStack>
          )}
        </Content>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            setModalIsOpen(false);
          }}
          variant="tertiary"
          type="reset"
        >
          Lukk
        </Button>

        {hasInactiveVariant && (
          <Button
            variant="primary"
            onClick={() => {
              handleGjenaktiverValgteProdukter(selectedRows);
            }}
            disabled={!hasInactiveSelected}
          >
            Gjenaktiver valgte produkter
          </Button>
        )}
        <Button
          onClick={() => handleFjernValgteProdukter(selectedRows)}
          type="submit"
          variant="secondary"
          disabled={!hasActiveSelected}
        >
          Fjern valgte produkter
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditProducstVariantsModal;
