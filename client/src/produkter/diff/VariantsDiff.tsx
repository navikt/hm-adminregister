import { BodyShort, Box, Heading, VStack } from "@navikt/ds-react";
import { useTranslation } from "react-i18next";
import styles from "./ShowDiffModal.module.scss";
import { ProductDifferenceDTO } from "api/VersionApi";

export const VariantsDiff = ({ variantDiffs }: { variantDiffs: ProductDifferenceDTO[] }) => {
  const { t } = useTranslation();

  if (!variantDiffs) {
    return <BodyShort>Ingen endringer på varianter</BodyShort>;
  }
  if (!variantDiffs.some((variant) => variant.difference.status === "DIFF" || variant.difference.status === "NEW")) {
    return <BodyShort>Ingen endringer på varianter</BodyShort>;
  } else {
    return (
      <VStack gap="2">
        <Heading size="small">Endringer i varianter</Heading>
        {variantDiffs && (
          <VStack gap="3">
            {variantDiffs
              .filter((changed) => changed.difference.status === "DIFF")
              .map((variant, i) => (
                <VStack gap="2" key={i} className={styles.changeRow}>
                  <BodyShort weight="semibold">{t(variant.product.articleName)}</BodyShort>
                  <Box>
                    <VStack gap="1">
                      {Object.entries(variant.difference.diff.entriesDiffering).map(([key, value], index) => (
                        <VStack gap="2" key={index} className={styles.changeRow}>
                          <BodyShort weight="semibold">{t(key)}</BodyShort>
                          <Box>
                            <VStack gap="1">
                              <i>Endret fra</i>
                              <Box padding="2" background="surface-danger-subtle" className={styles.previous}>
                                <>{value.second}</>
                              </Box>
                              til
                              <Box padding="2" background="surface-success-subtle" className={styles.current}>
                                <>{value.first}</>
                              </Box>
                            </VStack>
                          </Box>
                        </VStack>
                      ))}
                    </VStack>
                  </Box>
                </VStack>
              ))}

            <BodyShort>Nye varianter</BodyShort>
            {variantDiffs
              .filter((changed) => changed.difference.status === "NEW")
              .map((variant, i) => (
                <VStack gap="2" key={i} className={styles.changeRow}>
                  <BodyShort weight="semibold">{t(variant.product.articleName)}</BodyShort>
                </VStack>
              ))}
          </VStack>
        )}
      </VStack>
    );
  }
};
