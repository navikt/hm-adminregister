import { Link, useParams } from "react-router-dom";

import { ArrowLeftIcon, ExternalLinkIcon } from "@navikt/aksel-icons";
import {
  Box,
  Heading,
  HGrid,
  HStack,
  Label,
  Link as AkselLink,
  Loader,
  Switch,
  Tabs,
  Tag,
  VStack,
} from "@navikt/ds-react";
import DefinitionList from "felleskomponenter/definition-list/DefinitionList";

import ErrorAlert from "error/ErrorAlert";
import { updateEgnetForBrukerpassbruker, updateEgnetForKommunalTekniker, usePartByProductId } from "api/PartApi";
import { HM_REGISTER_URL } from "environments";
import { SeriesCompabilityTab } from "parts/compatibility/SeriesCompabilityTab";
import { VariantCompabilityTab } from "parts/compatibility/VariantCompabilityTab";
import { useState } from "react";
import { useSeriesV2Conditional } from "api/SeriesApi";
import { numberOfImages } from "products/seriesUtils";
import { TabLabel } from "felleskomponenter/TabLabel";
import ImagesTab from "parts/ImagesTab";

const Part = () => {
  const { productId } = useParams();

  const { part, isLoading, error, mutate } = usePartByProductId(productId!);
  const {
    data: series,
    isLoading: isLoadingSeries,
    error: errorSeries,
    mutate: mutateSeries,
  } = useSeriesV2Conditional(part?.seriesUUID || undefined);

  const [isTogglingKT, setIsTogglingKT] = useState(false);

  const toggleEgnetForKommunalTekniker = (checked: boolean, id: string) => {
    setIsTogglingKT(true);
    updateEgnetForKommunalTekniker(id, checked).then(() => {
      mutate();
    });
    setIsTogglingKT(false);
  };
  const toggleEgnetForBrukerpassbruker = (checked: boolean, id: string) => {
    updateEgnetForBrukerpassbruker(id, checked).then(() => {
      mutate();
    });
  };

  if (isLoading || isLoadingSeries) {
    return (
      <HGrid gap="12" columns="minmax(16rem, 55rem)">
        <Loader size="large" />
      </HGrid>
    );
  }

  if (!part || error || !productId || !series) {
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
        columns={{
          xs: 1,
          sm: "minmax(16rem, 48rem)",
          xl: "minmax(16rem, 48rem)",
          "2xl": "minmax(16rem, 80rem)",
        }}
      >
        <VStack gap={{ xs: "6", md: "10" }}>
          <VStack gap="6">
            <AkselLink
              as={Link}
              to="/deler"
              onClick={() => {
                history.back();
              }}
            >
              <ArrowLeftIcon fontSize="1.5rem" aria-hidden />
              Tilbake
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

              {part.isExpired && (
                <Box>
                  <Tag variant="warning-moderate">Utgått</Tag>
                </Box>
              )}
            </VStack>

            <HGrid gap={{ xs: "8", md: "10" }} columns={{ xs: 1, lg: 2 }}>
              <DefinitionList fullWidth horizontal>
                <DefinitionList.Term>Type</DefinitionList.Term>
                <DefinitionList.Definition>
                  {part.accessory === true ? "Tilbehør" : "Reservedel"}
                </DefinitionList.Definition>
                <DefinitionList.Term>HMS-nummer</DefinitionList.Term>
                <DefinitionList.Definition>{part.hmsArtNr ? part.hmsArtNr : "-"}</DefinitionList.Definition>
                <DefinitionList.Term>Leverandør</DefinitionList.Term>
                <DefinitionList.Definition>{part.supplierName ? part.supplierName : "-"}</DefinitionList.Definition>
                <DefinitionList.Term>Lev-artnr</DefinitionList.Term>
                <DefinitionList.Definition>{part.supplierRef ? part.supplierRef : "-"}</DefinitionList.Definition>
              </DefinitionList>
              <Box>
                <Switch
                  disabled={isTogglingKT}
                  checked={part.productData.attributes.egnetForKommunalTekniker || false}
                  onChange={(e) => toggleEgnetForKommunalTekniker(e.target.checked, part.id)}
                >
                  Egnet for kommunal tekniker
                </Switch>
                <Switch
                  checked={part.productData.attributes.egnetForBrukerpass || false}
                  onChange={(e) => toggleEgnetForBrukerpassbruker(e.target.checked, part.id)}
                >
                  Egnet for brukerpassbruker
                </Switch>
              </Box>
            </HGrid>
          </VStack>

          <Tabs defaultValue={"variantkoblinger"}>
            <Tabs.List>
              <Tabs.Tab
                value={"variantkoblinger"}
                label={`Koblinger til enkeltprodukter  (${part.productData.attributes.compatibleWith?.productIds.length ?? 0})`}
              />
              <Tabs.Tab
                value={"seriekoblinger"}
                label={`Koblinger til produktserier  (${part.productData.attributes.compatibleWith?.seriesIds.length ?? 0})`}
              />
              <Tabs.Tab
                value={"images"}
                label={
                  <TabLabel title="Bilder" numberOfElements={numberOfImages(series)} showAlert={false} isValid={true} />
                }
              />
            </Tabs.List>
            <Tabs.Panel value="variantkoblinger">
              <VariantCompabilityTab
                partId={productId}
                productIds={part.productData.attributes.compatibleWith?.productIds ?? []}
                mutatePart={mutate}
              />
            </Tabs.Panel>
            <Tabs.Panel value={"seriekoblinger"}>
              <SeriesCompabilityTab
                partId={productId}
                productIds={part.productData.attributes.compatibleWith?.productIds ?? []}
                seriesIds={part.productData.attributes.compatibleWith?.seriesIds ?? []}
                mutatePart={mutate}
              />
            </Tabs.Panel>
            <ImagesTab series={series} isEditable={true} showInputError={false} mutateSeries={mutateSeries} />
          </Tabs>
        </VStack>
      </HGrid>
    </main>
  );
};
export default Part;
