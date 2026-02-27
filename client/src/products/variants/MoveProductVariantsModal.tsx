import { BodyShort, Box, Button, Checkbox, Modal, Table, TextField, VStack } from "@navikt/ds-react";
import Content from "felleskomponenter/styledcomponents/Content";
import { ProductRegistrationDTOV2, SeriesDTO } from "utils/types/response-types";
import React, { useEffect, useState } from "react";
import { getSeriesBySeriesId } from "api/SeriesApi";

interface Props {
  onClick: (seriesId: string, productVariantId: string[]) => void;
  onClose: () => void;
  isModalOpen: boolean;
  seriesId: string;
  variants: ProductRegistrationDTOV2[];
  seriesFromIso: string;
}

const MoveProductVariantsModal = ({ onClick, onClose, isModalOpen, variants, seriesFromIso }: Props) => {
  const [seriesIdToMoveTo, setSeriesIdToMoveTo] = useState<string>();
  const [variantIdsToMove, setVariantIdsToMove] = useState<string[]>();
  const [feilmelding, setFeilmelding] = useState<string | undefined>(undefined);
  const [seriesToPreview, setSeriesToPreview] = useState<SeriesDTO | undefined>();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const toggleSelectedRow = (value: string) =>
    setSelectedRows((list: string[]): string[] =>
      list.includes(value) ? list.filter((id: string) => id !== value) : [...list, value],
    );

  useEffect(() => {
    setVariantIdsToMove(selectedRows);
  }, [selectedRows]);

  const onClickGetSeries = async () => {
    if (!seriesIdToMoveTo) {
      setFeilmelding("Fyll inn serie-id");
      setSeriesToPreview(undefined);
      return;
    }
    getSeriesBySeriesId(seriesIdToMoveTo)
      .then((series) => {
        setSeriesIdToMoveTo(series.id);
        setSeriesToPreview(series);
        if (seriesFromIso !== series.isoCategory?.isoCode) {
          setFeilmelding("Seriene har ulik ISO-kode");
        } else {
          setFeilmelding(undefined);
        }
      })
      .catch(() => {
        setSeriesToPreview(undefined);
        setFeilmelding("Fant ikke serie");
      });
  };

  return (
    <Modal
      open={isModalOpen}
      header={{
        heading: "Flytt varianter til annen serie",
        closeButton: false,
      }}
      onClose={onClose}
    >
      <Modal.Body>
        <Content>
          <VStack gap="space-4">
            <TextField
              label=" Hvilken serie vil du flytte til?"
              placeholder="Serie-id (eks. 074b6837-0cd1-49c5-b048-45486c378fb4)"
              onChange={(event) => setSeriesIdToMoveTo(event.target.value)}
              error={feilmelding !== undefined ? feilmelding : undefined}
            />
            <Button onClick={onClickGetSeries} type="button" variant="secondary" style={{ marginLeft: "auto" }}>
              Hent produkt
            </Button>
            {seriesToPreview && (
              <BodyShort>
                <Box background="raised" padding="space-4" borderRadius="8" shadow="dialog">
                  <b>{seriesToPreview ? `${seriesToPreview.title}` : "Fant ikke serie"}</b>
                </Box>
              </BodyShort>
            )}
          </VStack>

          {(variants && (
            <VStack style={{ marginTop: "1.5rem" }}>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                    <Table.HeaderCell scope="col">HMS-nummer</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Lev-artnr.</Table.HeaderCell>
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
          )) || <BodyShort>Ingen varianter: {variants?.length} </BodyShort>}
        </Content>
      </Modal.Body>

      <Modal.Footer>
        <Button
          onClick={() => {
            onClick(seriesIdToMoveTo!, variantIdsToMove!);
            setVariantIdsToMove([]);
            setFeilmelding(undefined);
            setSelectedRows([]);
          }}
          variant={"primary"}
          disabled={
            !seriesIdToMoveTo || !variantIdsToMove || variantIdsToMove.length === 0 || feilmelding !== undefined
          }
        >
          OK
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MoveProductVariantsModal;
