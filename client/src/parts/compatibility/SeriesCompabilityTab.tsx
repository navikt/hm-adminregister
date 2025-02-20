import { BodyLong, Box, Button, Checkbox, HStack, Table, VStack } from "@navikt/ds-react";
import React from "react";
import styles from "parts/PartPage.module.scss";
import { PlusCircleIcon, TrashIcon } from "@navikt/aksel-icons";
import { RowBoxTable } from "felleskomponenter/styledcomponents/Table";
import { CompatibleSeriesRow } from "parts/compatibility/CompatibleSeriesRow";

interface SeriesCompabilityTabProps {
  seriesIds: string[];
  productIds: string[];
}

export const SeriesCompabilityTab = ({ seriesIds, productIds }: SeriesCompabilityTabProps) => {
  if (seriesIds.length < 1) {
    return <BodyLong>Ingen koblinger til serier</BodyLong>;
  }

  return (
    <>
      <VStack padding={"8"} gap={"2"}>
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
                        {/*<Table.HeaderCell scope="col"></Table.HeaderCell>*/}
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {seriesIds.map((seriesId) => (
                        <CompatibleSeriesRow productIds={productIds} seriesUUID={seriesId} key={seriesId} />
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
