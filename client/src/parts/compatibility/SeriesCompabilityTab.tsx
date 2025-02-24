import { BodyLong, Box, Button, HStack, Table, VStack } from "@navikt/ds-react";
import React from "react";
import styles from "parts/PartPage.module.scss";
import { RowBoxTable } from "felleskomponenter/styledcomponents/Table";
import { CompatibleSeriesRow } from "parts/compatibility/CompatibleSeriesRow";
import RemoveCompatibleSeriesVariantsModal from "parts/compatibility/RemoveCompatibleSeriesVariantsModal";
import AddCompatibleSeriesVariantsModal from "parts/compatibility/AddCompatibleSeriesVariantsModal";
import NewCompatibleSeriesOnPartModal from "parts/compatibility/NewCompatibleSeriesOnPartModal";
import { PlusCircleIcon } from "@navikt/aksel-icons";

interface SeriesCompabilityTabProps {
  seriesIds: string[];
  productIds: string[];
  partId: string;
  mutatePart: () => void;
}

export const SeriesCompabilityTab = ({ seriesIds, productIds, partId, mutatePart }: SeriesCompabilityTabProps) => {
  const [selectedSeriesId, setSelectedSeriesId] = React.useState<string | undefined>(undefined);
  const [removeCompatibleSeriesVariantsModalIsOpen, setRemoveCompatibleSeriesVariantsModalIsOpen] =
    React.useState(false);
  const [addCompatibleSeriesVariantsModalIsOpen, setAddCompatibleSeriesVariantsModalIsOpen] = React.useState(false);
  const [newCompatibleSeriesModalIsOpen, setNewCompatibleSeriesModalIsOpen] = React.useState(false);

  if (seriesIds.length < 1) {
    return <BodyLong>Ingen koblinger til serier</BodyLong>;
  }

  return (
    <>
      <NewCompatibleSeriesOnPartModal
        modalIsOpen={newCompatibleSeriesModalIsOpen}
        setModalIsOpen={setNewCompatibleSeriesModalIsOpen}
        partId={partId}
        mutatePart={mutatePart}
      />
      <RemoveCompatibleSeriesVariantsModal
        seriesUUID={selectedSeriesId}
        modalIsOpen={removeCompatibleSeriesVariantsModalIsOpen}
        setModalIsOpen={setRemoveCompatibleSeriesVariantsModalIsOpen}
        partId={partId}
        mutatePart={mutatePart}
        productIds={productIds}
      />
      <AddCompatibleSeriesVariantsModal
        seriesUUID={selectedSeriesId}
        modalIsOpen={addCompatibleSeriesVariantsModalIsOpen}
        setModalIsOpen={setAddCompatibleSeriesVariantsModalIsOpen}
        partId={partId}
        mutatePart={mutatePart}
        productIds={productIds}
      />
      <VStack padding={"8"} gap={"2"}>
        <Button
          className="fit-content"
          variant="primary"
          icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
          onClick={() => {
            setNewCompatibleSeriesModalIsOpen(true);
          }}
        >
          Legg til kobling
        </Button>
        {seriesIds.length > 0 && (
          <Box className={styles.compabilityBox}>
            <VStack gap={"2"}>
              {/*<Button*/}
              {/*  className="fit-content"*/}
              {/*  variant="primary"*/}
              {/*  icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}*/}
              {/*  onClick={() => {}}*/}
              {/*>*/}
              {/*  Legg til kobling*/}
              {/*</Button>*/}
              <HStack gap={"2"}>
                {seriesIds.length > 0 && (
                  <RowBoxTable>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Leverandør</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Tilknyttede varianter</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Ikke tilknyttede varianter</Table.HeaderCell>
                        {/*<Table.HeaderCell scope="col"></Table.HeaderCell>*/}
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {seriesIds.map((seriesId) => (
                        <CompatibleSeriesRow
                          productIds={productIds}
                          seriesUUID={seriesId}
                          key={seriesId}
                          setRemoveModalIsOpen={setRemoveCompatibleSeriesVariantsModalIsOpen}
                          setAddModalIsOpen={setAddCompatibleSeriesVariantsModalIsOpen}
                          setSelectedSeriesId={setSelectedSeriesId}
                        />
                      ))}
                    </Table.Body>
                  </RowBoxTable>
                )}
              </HStack>
              <HStack justify={"end"}>
                {/*<Button*/}
                {/*  className="fit-content"*/}
                {/*  variant="tertiary"*/}
                {/*  icon={<TrashIcon fontSize="1.5rem" aria-hidden />}*/}
                {/*  disabled={true}*/}
                {/*  onClick={() => {}}*/}
                {/*>*/}
                {/*  <span>Slett merkede koblinger</span>*/}
                {/*</Button>*/}
              </HStack>
            </VStack>
          </Box>
        )}
      </VStack>
    </>
  );
};
