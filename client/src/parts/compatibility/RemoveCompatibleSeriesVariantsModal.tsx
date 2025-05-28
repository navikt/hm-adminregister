import { Button, Checkbox, Heading, Loader, Modal, Table, VStack } from "@navikt/ds-react";
import React, { useEffect, useState } from "react";
import { useErrorStore } from "utils/store/useErrorStore";
import Content from "felleskomponenter/styledcomponents/Content";
import { useSeriesV2Conditional } from "api/SeriesApi";
import { getVariantsBySeriesUUID, removeCompatibleWithVariant } from "api/PartApi";
import { ProductRegistrationDTOV2 } from "utils/types/response-types";

interface Props {
  modalIsOpen: boolean;
  setModalIsOpen: (open: boolean) => void;
  seriesUUID?: string;
  partId: string;
  productIds: string[];
  mutatePart: () => void;
}

const RemoveCompatibleSeriesVariantsModal = ({
  modalIsOpen,
  setModalIsOpen,
  seriesUUID,
  partId,
  mutatePart,
  productIds,
}: Props) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const { setGlobalError } = useErrorStore();
  const { data: series, isLoading: isLoadingSeries, error: errorSeries } = useSeriesV2Conditional(seriesUUID);
  const { data: variants, isLoading: isLoadingVariants, error: errorVariants } = getVariantsBySeriesUUID(seriesUUID);
  const [filtreredVariants, setFiltreredVariants] = useState<ProductRegistrationDTOV2[]>([]);

  useEffect(() => {
    if (variants) {
      setFiltreredVariants(variants.filter((variant) => productIds.includes(variant.id!)));
    }
  }, [variants, productIds]);

  const toggleSelectedRow = (value: string) =>
    setSelectedRows((list: string[]): string[] =>
      list.includes(value) ? list.filter((id: string) => id !== value) : [...list, value],
    );

  const handleFjernValgteProdukter = (selectedRows: string[]) => {
    removeCompatibleWithVariant(partId, selectedRows)
      .then(() => {
        mutatePart();
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
        heading: ``,
        closeButton: false,
        size: "small",
      }}
      onClose={() => setModalIsOpen(false)}
    >
      <Modal.Body>
        <Content>
          {!filtreredVariants || !series ? (
            <Loader />
          ) : filtreredVariants.length > 0 ? (
            <VStack gap="2" style={{ width: "100%" }}>
              <Heading size={"medium"}>Varianter tilknyttet på del</Heading>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                    <Table.HeaderCell scope="col">HMS-nummer</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Lev-artnr.</Table.HeaderCell>
                    <Table.DataCell>
                      <Checkbox
                        checked={selectedRows.length === filtreredVariants.length}
                        onChange={() => {
                          selectedRows.length
                            ? setSelectedRows([])
                            : setSelectedRows(filtreredVariants.map(({ id }) => id!));
                        }}
                        hideLabel
                      >
                        Velg alle rader
                      </Checkbox>
                    </Table.DataCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filtreredVariants.map((variant, i) => {
                    return (
                      <Table.Row key={variant.id}>
                        <Table.DataCell>{variant.articleName}</Table.DataCell>
                        <Table.DataCell>{variant.hmsArtNr}</Table.DataCell>
                        <Table.DataCell>{variant.supplierRef}</Table.DataCell>
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
          ) : (
            <Heading size={"medium"}>Ingen varianter på serien er tilknyttet</Heading>
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
        <Button
          onClick={() => handleFjernValgteProdukter(selectedRows)}
          type="submit"
          variant="secondary"
          disabled={selectedRows.length === 0}
        >
          Fjern valgte varianter
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RemoveCompatibleSeriesVariantsModal;
