import { CompatibleWith } from "utils/types/response-types";
import { BodyLong, Button, Heading, HStack, VStack } from "@navikt/ds-react";
import { CompatibleSeriesCard } from "parts/compatibility/CompatibleSeriesCard";
import { CompatibleVariantCard } from "parts/compatibility/CompatibleVariantCard";
import { PlusCircleIcon, TrashIcon } from "@navikt/aksel-icons";

interface CompabilityListProps {
  compatibleWith?: CompatibleWith | null;
}

export const CompabilityList = ({ compatibleWith }: CompabilityListProps) => {
  if (!compatibleWith) {
    return <BodyLong>Ingen koblinger til serier eller produkter</BodyLong>;
  }

  return (
    <VStack gap={"2"}>
      {compatibleWith.seriesIds.length > 0 && (
        <VStack gap={"2"}>
          <Heading size={"small"}>Kompatibel med serier</Heading>
          <Button
            className="fit-content"
            variant="tertiary"
            icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
            onClick={() => {}}
          >
            Legg til kobling
          </Button>
          <HStack gap={"2"}>
            {compatibleWith?.seriesIds.map((seriesId) => <CompatibleSeriesCard seriesUUID={seriesId} key={seriesId} />)}
          </HStack>
        </VStack>
      )}

      {compatibleWith.productIds.length > 0 && (
        <VStack gap={"2"}>
          <Heading size={"small"}>Kompatibel med varianter</Heading>
          <Button
            className="fit-content"
            variant="tertiary"
            icon={<PlusCircleIcon fontSize="1.5rem" aria-hidden />}
            onClick={() => {}}
          >
            Legg til kobling
          </Button>
          <HStack gap={"2"}>
            {compatibleWith?.productIds.map((productId) => (
              <CompatibleVariantCard productId={productId} key={productId} />
            ))}
          </HStack>
        </VStack>
      )}
    </VStack>
  );
};
