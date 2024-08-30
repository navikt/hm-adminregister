import { ChevronRightIcon, FileImageIcon } from "@navikt/aksel-icons";
import { BodyShort, Box, Heading, HGrid, Hide, Show, VStack } from "@navikt/ds-react";
import { seriesStatus } from "products/seriesUtils";
import { Link } from "react-router-dom";
import { SeriesRegistrationDTO } from "utils/types/response-types";
import { ImageContainer } from "./files/images/ImageContainer";
import styles from "./ProductList.module.scss";
import SeriesStatusTag from "./SeriesStatusTag";

export const ProductList = ({ seriesList, heading }: { seriesList: SeriesRegistrationDTO[]; heading?: string }) => {
  return (
    <VStack gap={"1-alt"} className={styles.seriesList}>
      {heading && <Heading size="medium">{heading}</Heading>}
      <HGrid columns={{ xs: ".7fr 3.6fr 2.1fr .8fr", md: ".7fr 3.6fr 2.1fr .9fr 0.4fr" }} padding={"2"} gap={"2"}>
        <b>Produktnavn</b>
        <span />
        <b>Status</b>
        <b>Varianter</b>
        <span />
      </HGrid>

      <VStack as={"ol"} gap={"1-alt"} className={styles.seriesList}>
        {seriesList.map((series) => (
          <li key={series.id}>
            <SeriesCard series={series} />
          </li>
        ))}
      </VStack>
    </VStack>
  );
};

const SeriesCard = ({ series }: { series: SeriesRegistrationDTO }) => {
  const imgUrl = series.seriesData.media
    .filter((media) => media.type === "IMAGE")
    .find((media) => media.priority === 1);

  return (
    <HGrid
      as={Link}
      to={`/produkter/${series.id}`}
      columns={{ xs: ".7fr 3.5fr 2fr .8fr", md: ".7fr 3.5fr 2fr .8fr 0.4fr" }}
      gap={"2"}
      align={"center"}
      className={styles.seriesPanel}
    >
      <Box
        className={styles.imageBox}
        borderRadius="medium"
        borderWidth="1"
        width="75px"
        height="75px"
        style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        {imgUrl?.uri ? (
          <ImageContainer uri={imgUrl?.uri} size="xsmall" />
        ) : (
          <FileImageIcon title="Produkt mangler bilde" fontSize="2rem" />
        )}
      </Box>
      <BodyShort weight="semibold" className="text-overflow-hidden-small-2-lines">
        {series.title}
      </BodyShort>
      <Show below="md">
        <SeriesStatusTag iconOnly seriesStatus={seriesStatus(series)} />
      </Show>
      <Hide below="md">
        <SeriesStatusTag seriesStatus={seriesStatus(series)} />
      </Hide>

      <Show below="md">
        <BodyShort align="center">{series.count}</BodyShort>
      </Show>
      <Hide below="md">
        <BodyShort>{series.count}</BodyShort>
      </Hide>
      <Hide below="md">
        <ChevronRightIcon aria-hidden fontSize="2rem" />
      </Hide>
    </HGrid>
  );
};
