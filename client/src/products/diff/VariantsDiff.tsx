import { BodyShort, Box, Heading, VStack } from "@navikt/ds-react";
import { useTranslation } from "react-i18next";
import styles from "./ShowDiffModal.module.scss";
import { ProductDifferenceDTO } from "api/VersionApi";
import { TechDataDiff } from "products/diff/TechDataDiff";
import { Strikethrough } from "products/diff/Strikethrough";

export const VariantsDiff = ({ variantDiffs }: { variantDiffs: ProductDifferenceDTO[] }) => {
  const { t } = useTranslation();

  if (
    !variantDiffs ||
    variantDiffs.length === 0 ||
    variantDiffs.every((value) => value.difference.status === "NO_DIFF")
  ) {
    return <BodyShort>Ingen endringer på varianter</BodyShort>;
  }
  if (!variantDiffs.some((variant) => variant.difference.status === "DIFF" || variant.difference.status === "NEW")) {
    return <BodyShort>Ingen endringer på varianter</BodyShort>;
  } else {
    return (
      <VStack gap="space-2">
        <Heading size="xsmall">Endringer i varianter</Heading>
        {variantDiffs && (
          <VStack gap="space-4">
            {variantDiffs
              .filter((changed) => changed.difference.status === "DIFF")
              .map((variant, i) => (
                <VStack key={i} className={styles.changeRow}>
                  <BodyShort weight="semibold">{t(variant.product.articleName)}</BodyShort>
                  <VStack>
                    {Object.entries(variant.difference.diff.entriesDiffering)
                      .filter(([key]) => key !== "productData.techData")
                      .map(([key, value], index) => (
                        <VStack key={index} className={styles.field}>
                          <BodyShort weight="semibold">{t(key)}</BodyShort>
                          <VStack gap="space-1">
                            <Box padding="space-2" background="danger-soft" className={styles.previous}>
                              <Strikethrough>{arrayCheck(value.second)}</Strikethrough>
                            </Box>
                            <Box padding="space-2" background="success-soft" className={styles.current}>
                              <>{arrayCheck(value.first)}</>
                            </Box>
                          </VStack>
                        </VStack>
                      ))}
                    <TechDataDiff diffDto={variant.difference} />
                  </VStack>
                </VStack>
              ))}

            {variantDiffs.filter((changed) => changed.difference.status === "NEW").length > 0 && (
              <>
                <Heading size="small">Nye varianter</Heading>
                <ul>
                  {variantDiffs
                    .filter((changed) => changed.difference.status === "NEW")
                    .map((variant, i) => (
                      <li key={i}>{t(variant.product.articleName)}</li>
                    ))}
                </ul>
              </>
            )}
          </VStack>
        )}
      </VStack>
    );
  }
};

const arrayCheck = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((val, i) => <span key={i}> {val as string} </span>);
  } else {
    return <span>{value as string}</span>;
  }
};
