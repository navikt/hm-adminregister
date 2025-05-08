import { ChevronDownIcon, ChevronUpIcon } from "@navikt/aksel-icons";
import { BodyShort, Box, HGrid, Tag, VStack } from "@navikt/ds-react";
import { SeriesSearchDTO } from "utils/types/response-types";
import styles from "./SeriesList.module.scss";
import { SeriesParts } from "parts/series/SeriesParts";

interface SeriesListProps {
  seriesList: SeriesSearchDTO[];
  onSeriesClick: (seriesId: string) => void;
  selectedSeriesId?: string;
}

export const SeriesList = ({ seriesList, onSeriesClick, selectedSeriesId }: SeriesListProps) => {
  return (
    <VStack as={"ol"} gap={"1-alt"} className={styles.seriesList}>
      {seriesList.map((series) => (
        <li key={series.id}>
          <SeriesCard series={series} onSeriesClick={onSeriesClick} selectedSeriesId={selectedSeriesId} />
          {selectedSeriesId === series.id && <SeriesParts seriesId={selectedSeriesId} />}
        </li>
      ))}
    </VStack>
  );
};

const SeriesCard = ({
  series,
  onSeriesClick,
  selectedSeriesId,
}: {
  series: SeriesSearchDTO;
  onSeriesClick: (seriesId: string) => void;
  selectedSeriesId?: string;
}) => {
  const isExpired = series.isExpired;

  return (
    <HGrid
      columns={{
        xs: " 1fr auto",
        md: "1fr auto",
      }}
      gap={"2"}
      align={"center"}
      className={selectedSeriesId === series.id ? styles.seriesPanelSelected : styles.seriesPanel}
      onClick={() => onSeriesClick(series.id)}
    >
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

      {selectedSeriesId === series.id ? (
        <ChevronUpIcon aria-hidden fontSize="2rem" />
      ) : (
        <ChevronDownIcon aria-hidden fontSize="2rem" />
      )}
    </HGrid>
  );
};
