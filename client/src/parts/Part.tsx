import { Link, useParams } from "react-router-dom";

import { ArrowLeftIcon, ExternalLinkIcon } from "@navikt/aksel-icons";
import {
  Box,
  CopyButton,
  Detail,
  Heading,
  HGrid,
  HStack,
  Label,
  Link as AkselLink,
  Loader,
  Tag,
  VStack,
} from "@navikt/ds-react";
import DefinitionList from "felleskomponenter/definition-list/DefinitionList";

import ErrorAlert from "error/ErrorAlert";
import { useAuthStore } from "utils/store/useAuthStore";
import styles from "./PartPage.module.scss";
import { usePartByProductId } from "api/PartApi";
import { useSeriesV2Conditional } from "api/SeriesApi";
import { HM_REGISTER_URL } from "environments";
import { CompabilityList } from "parts/compatibility/CompabilityList";

const Part = () => {
  const { productId } = useParams();

  const { loggedInUser } = useAuthStore();
  const { part, isLoading, error, mutate } = usePartByProductId(productId!);
  const {
    data: series,
    isLoading: isLoadingSeries,
    error: errorSeries,
  } = useSeriesV2Conditional(part?.seriesUUID ?? undefined);

  if (isLoading || isLoadingSeries) {
    return (
      <HGrid gap="12" columns="minmax(16rem, 55rem)">
        <Loader size="large" />
      </HGrid>
    );
  }

  if (!part || !series || error || errorSeries) {
    return (
      <main className="show-menu">
        <ErrorAlert />
      </main>
    );
  }

  return (
    <main className="show-menu">
      <HGrid
        gap="12"
        columns={{ xs: 1, sm: "minmax(16rem, 48rem) 200px", xl: "minmax(16rem, 48rem) 250px" }}
        className={styles.productPage}
      >
        <VStack gap={{ xs: "6", md: "10" }}>
          <VStack gap="6">
            <AkselLink as={Link} to="/deler">
              <ArrowLeftIcon fontSize="1.5rem" aria-hidden />
              Tilbake til oversikt
            </AkselLink>
            <VStack gap="2">
              <Label> Navn på del</Label>
              <HStack gap="1">
                <Heading level="1" size="large">
                  {part.articleName ?? ""}{" "}
                  {part.isPublished && part.hmsArtNr && (
                    <AkselLink
                      as={Link}
                      to={`${HM_REGISTER_URL()}/produkt/hmsartnr/${part.hmsArtNr}`}
                      target={"_blank"}
                    >
                      <ExternalLinkIcon title="Se på Finn Hjelpemiddel" fontSize="1.5rem" />
                    </AkselLink>
                  )}
                </Heading>
              </HStack>
              {loggedInUser?.isAdmin && (
                <HStack align="center">
                  <Detail>{part.id}</Detail>
                  <CopyButton size="xsmall" copyText={series.id} />
                </HStack>
              )}

              {part.isExpired && (
                <Box>
                  <Tag variant="warning-moderate">Utgått</Tag>
                </Box>
              )}
            </VStack>
            <DefinitionList fullWidth horizontal>
              <DefinitionList.Term>Type</DefinitionList.Term>
              <DefinitionList.Definition>
                {part.accessory === true ? "Tilbehør" : "Reservedel"}
              </DefinitionList.Definition>
              <DefinitionList.Term>HMS-nummer</DefinitionList.Term>
              <DefinitionList.Definition>{part.hmsArtNr ? part.hmsArtNr : "-"}</DefinitionList.Definition>
              <DefinitionList.Term>Leverandør</DefinitionList.Term>
              <DefinitionList.Definition>{series.supplierName ? series.supplierName : "-"}</DefinitionList.Definition>
              <DefinitionList.Term>Lev-artnr</DefinitionList.Term>
              <DefinitionList.Definition>{part.supplierRef ? part.supplierRef : "-"}</DefinitionList.Definition>
            </DefinitionList>
          </VStack>

          <CompabilityList compatibleWith={part.productData.attributes.compatibleWith} />
        </VStack>
      </HGrid>
    </main>
  );
};
export default Part;
