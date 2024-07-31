import { SeriesRegistrationDTO } from "utils/types/response-types";
import { Heading, HGrid, VStack } from "@navikt/ds-react";
import styles from "products/SeriesTable.module.scss";
import SeriesStatusTag from "products/SeriesStatusTag";
import { seriesStatus } from "products/seriesUtils";
import { Link } from "react-router-dom";

export const SeriesTable = ({ seriesList, heading }: { seriesList: SeriesRegistrationDTO[]; heading?: string }) => {
  return (
    <VStack gap={"1-alt"} className={styles.seriesList}>
      {heading && <Heading size="medium">{heading}</Heading>}
      <HGrid columns={"1fr 2fr 1fr"} padding={"2"} gap={"2"}>
        <b>Produktnavn</b>
        <b>Status</b>
        <b>Antall varianter</b>
      </HGrid>

      <VStack as={"ol"} gap={"1-alt"} className={styles.seriesList}>
        {seriesList.map((series) => (
          <li key={series.id}>
            <HGrid
              as={Link}
              to={`/produkter/${series.id}`}
              columns={"1fr 2fr 1fr"}
              gap={"2"}
              align={"center"}
              className={styles.seriesPanel}
            >
              <b>{series.title}</b>
              <SeriesStatusTag seriesStatus={seriesStatus(series)} />
              {series.count}
            </HGrid>
          </li>
        ))}
      </VStack>
    </VStack>
  );
};
