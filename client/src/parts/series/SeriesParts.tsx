import { Box, Button, Checkbox, Heading, HStack, Loader, Table, VStack } from "@navikt/ds-react";
import { useSeriesV2 } from "api/SeriesApi";
import styles from "./SeriesParts.module.scss";
import { getPartsForSeriesId, removeCompatibleWithSeriesForParts } from "api/PartApi";
import { CompatibleVariantRow } from "parts/compatibility/CompatibleVariantRow";
import React, { useState } from "react";
import { PlusCircleIcon, TrashIcon } from "@navikt/aksel-icons";
import NewCompatiblePartsOnSeries from "parts/series/NewCompatiblePartsOnSeries";

interface SeriesPartsProps {
  seriesId: string;
}

export const SeriesParts = ({ seriesId }: SeriesPartsProps) => {
  const { data: series, isLoading: isLoadingSeries, error: errorSeries, mutate: mutateSeries } = useSeriesV2(seriesId);
  const {
    data: seriesParts,
    isLoading: isLoadingSeriesParts,
    error: errorSeriesParts,
    mutate: mutateParts,
  } = getPartsForSeriesId(seriesId);

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [newCompatibleProductModalIsOpen, setNewCompatibleProductModalIsOpen] = React.useState(false);
  const toggleSelectedRow = (value: string) =>
    setSelectedRows((list: string[]): string[] =>
      list.includes(value) ? list.filter((id: string) => id !== value) : [...list, value],
    );

  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMarkedCompatibleProducts = () => {
    setIsDeleting(true);
    removeCompatibleWithSeriesForParts(seriesId, selectedRows).then(() => {
      mutateParts();
      setSelectedRows([]);
    });
    setIsDeleting(false);
  };

  if (isLoadingSeries || !series || isLoadingSeriesParts || !seriesParts) {
    return <Loader />;
  }

  return (
    <>
      <NewCompatiblePartsOnSeries
        modalIsOpen={newCompatibleProductModalIsOpen}
        setModalIsOpen={setNewCompatibleProductModalIsOpen}
        seriesId={seriesId}
        mutateParts={mutateParts}
      />
      <Box className={styles.seriesParts}>
        {seriesParts.length === 0 ? (
          <Box padding="8">
            <Heading level="1" size="xsmall">
              Ingen deler i serien
            </Heading>
          </Box>
        ) : (
          <></>
        )}

        {seriesParts.length > 0 && (
          <Box background="bg-default" padding="8">
            <VStack gap="8">
              <Button
                className="fit-content"
                variant="primary"
                icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
                onClick={() => {
                  setNewCompatibleProductModalIsOpen(true);
                }}
              >
                Legg til kobling
              </Button>
              <Table size="small">
                <Table.Header>
                  <Table.Row key={"header"}>
                    <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                    <Table.HeaderCell scope="col">HMS-nummer</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Leverandør</Table.HeaderCell>
                    <Table.HeaderCell scope="col">
                      <Checkbox
                        checked={selectedRows.length === seriesParts.length}
                        onChange={() => {
                          if (selectedRows.length) {
                            setSelectedRows([]);
                          } else {
                            setSelectedRows(seriesParts.map((part) => part.id));
                          }
                        }}
                        hideLabel
                      >
                        Velg alle rader
                      </Checkbox>
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {seriesParts.map((part) => (
                    <CompatibleVariantRow
                      productId={part.id}
                      key={part.id}
                      selectedRows={selectedRows}
                      toggleSelectedRow={toggleSelectedRow}
                    />
                  ))}
                </Table.Body>
              </Table>
              <HStack justify={"end"} paddingBlock="8">
                <Button
                  className="fit-content"
                  variant="tertiary"
                  icon={<TrashIcon fontSize="1.5rem" aria-hidden />}
                  disabled={selectedRows.length === 0 || isDeleting}
                  onClick={deleteMarkedCompatibleProducts}
                >
                  <span>Slett merkede koblinger</span>
                </Button>
              </HStack>
            </VStack>
          </Box>
        )}
      </Box>
    </>
  );
};
