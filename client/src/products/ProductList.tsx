import { ChevronRightIcon, FileImageIcon } from "@navikt/aksel-icons";
import { BodyShort, Box, HGrid, Hide, Show, Tag, VStack } from "@navikt/ds-react";
import { seriesStatus } from "products/seriesUtils";
import { Link } from "react-router-dom";
import { toDate, toReadableDateTimeString } from "utils/date-util";
import { SeriesRegistrationDTO } from "utils/types/response-types";
import { ImageContainer } from "./files/images/ImageContainer";
import styles from "./ProductList.module.scss";
import SeriesStatusTag from "./SeriesStatusTag";

export const ProductList = ({
  seriesList,
  oversiktPath,
}: {
  seriesList: SeriesRegistrationDTO[];
  oversiktPath: string;
}) => {
  return (
    <VStack as={"ol"} gap={"1-alt"} className={styles.seriesList}>
      {seriesList.map((series) => (
        <li key={series.id}>
          <SeriesCard series={series} oversiktPath={oversiktPath} />
        </li>
      ))}
    </VStack>
  );
};

const SeriesCard = ({ series, oversiktPath }: { series: SeriesRegistrationDTO; oversiktPath: string }) => {
  const isExpired = toDate(series.expired) < new Date();
  const imgUrl = series.seriesData.media
    .filter((media) => media.type === "IMAGE")
    .find((media) => media.priority === 1);

  return (
    <HGrid
      as={Link}
      to={`/produkter/${series.id}`}
      state={oversiktPath}
      columns={{
        xs: ".7fr 3.5fr 2fr .8fr",
        md: ".7fr 3.5fr 2fr .8fr 0.4fr",
        lg: ".7fr 3.5fr 2.5fr .8fr 1fr 3fr 0.4fr",
      }}
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

      <VStack style={isExpired ? { height: "100%" } : {}} gap="1">
        {isExpired && (
          <Box>
            <Tag size="small" variant="neutral-moderate">
              Utgått
            </Tag>
          </Box>
        )}
        <BodyShort weight="semibold" className="text-overflow-hidden-small-2-lines">
          {series.title}
        </BodyShort>
      </VStack>

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

      <Hide below="lg">
        <BodyShort align="center">{toReadableDateTimeString(series.updated).replace(",", "")}</BodyShort>
      </Hide>

      <Hide below="lg">
        <BodyShort align="center">{series.updatedByUser}</BodyShort>
      </Hide>

      <Hide below="md">
        <ChevronRightIcon aria-hidden fontSize="2rem" />
      </Hide>
    </HGrid>
  );
};
