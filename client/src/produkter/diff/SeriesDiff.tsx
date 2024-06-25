import { DifferenceDTO } from "utils/types/response-types";
import { BodyShort, Box, Heading, VStack } from "@navikt/ds-react";
import { useTranslation } from "react-i18next";
import styles from "./ShowDiffModal.module.scss";

export const SeriesDiff = ({ seriesDiff }: { seriesDiff: DifferenceDTO }) => {
  const { t } = useTranslation();

  if (!seriesDiff) {
    return <></>;
  }
  if (seriesDiff.status === "NO_DIFF") {
    return <BodyShort>Ingen endringer</BodyShort>;
  } else {
    return (
      <VStack gap="2">
        <Heading size="medium">Endringer i serie</Heading>
        {seriesDiff.diff.entriesDiffering && (
          <VStack gap="3">
            {Object.entries(seriesDiff.diff.entriesDiffering).map(([key, value], index) =>
              key !== "seriesData.media" ? (
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
              ) : (
                <VStack gap="2" key={index} className={styles.changeRow}>
                  <BodyShort weight="semibold">Endring i bilder eller dokumenter</BodyShort>
                </VStack>
              ),
            )}
          </VStack>
        )}
      </VStack>
    );
  }
};
