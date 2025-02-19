import { useSeriesV2Conditional } from "api/SeriesApi";
import { Box, Button, HStack, Link, Loader, VStack } from "@navikt/ds-react";
import DefinitionList from "felleskomponenter/definition-list/DefinitionList";
import styles from "./CompabilityCard.module.scss";
import { HM_REGISTER_URL } from "environments";
import { ExternalLinkIcon, MinusCircleFillIcon, PlusCircleIcon, TrashIcon } from "@navikt/aksel-icons";

export const CompatibleSeriesCard = ({ seriesUUID }: { seriesUUID: string }) => {
  const { data: series, isLoading: isLoadingSeries, error: errorSeries } = useSeriesV2Conditional(seriesUUID);

  if (isLoadingSeries) {
    return <Loader />;
  }
  if (!series) {
    return <Box>Fant ikke serie</Box>;
  }

  return (
    <Box className={styles.card}>
      <VStack gap={"2"}>
        <DefinitionList fullWidth horizontal>
          <DefinitionList.Term>Navn</DefinitionList.Term>
          <DefinitionList.Definition>{series.title}</DefinitionList.Definition>
          <DefinitionList.Term>Leverandør</DefinitionList.Term>
          <DefinitionList.Definition>{series.supplierName}</DefinitionList.Definition>
        </DefinitionList>

        {series.isPublished && (
          <Link href={`${HM_REGISTER_URL()}/produkt/${series.id}`} target={"_blank"}>
            Se på Finn Hjelpemiddel
            <ExternalLinkIcon title="Se serie på Finn Hjelpemiddel" />
          </Link>
        )}

        <Button
          className="fit-content"
          variant="tertiary"
          icon={<TrashIcon fontSize="1.5rem" aria-hidden />}
          onClick={() => {}}
        >
          Fjern kobling
        </Button>
      </VStack>
    </Box>
  );
};
