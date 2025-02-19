import { useSeriesV2Conditional } from "api/SeriesApi";
import { Box, Button, Link, Loader, VStack } from "@navikt/ds-react";
import DefinitionList from "felleskomponenter/definition-list/DefinitionList";
import styles from "./CompabilityCard.module.scss";
import { HM_REGISTER_URL } from "environments";
import { ExternalLinkIcon, TrashIcon } from "@navikt/aksel-icons";
import { useCompatibleProductById } from "api/PartApi";

export const CompatibleVariantCard = ({ productId }: { productId: string }) => {
  const { product, isLoading, error } = useCompatibleProductById(productId);
  const {
    data: series,
    isLoading: isLoadingSeries,
    error: errorSeries,
  } = useSeriesV2Conditional(product?.seriesUUID ?? undefined);

  if (isLoading || isLoadingSeries) {
    return <Loader />;
  }
  if (!product || !series) {
    return <Box>Fant ikke produkt</Box>;
  }

  return (
    <Box className={styles.card}>
      <VStack gap={"2"}>
        <DefinitionList fullWidth horizontal>
          <DefinitionList.Term>Navn</DefinitionList.Term>
          <DefinitionList.Definition>{product.articleName}</DefinitionList.Definition>
          <DefinitionList.Term>Leverandør</DefinitionList.Term>
          <DefinitionList.Definition>{series.supplierName}</DefinitionList.Definition>
        </DefinitionList>

        {series.isPublished && product.hmsArtNr && (
          <Link href={`${HM_REGISTER_URL()}/produkt/hmsartnr/${product.hmsArtNr}`} target={"_blank"}>
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
