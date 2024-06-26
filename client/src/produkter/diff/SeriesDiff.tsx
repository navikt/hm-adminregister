import { DifferenceDTO } from "utils/types/response-types";
import { BodyShort, Box, Heading, VStack } from "@navikt/ds-react";
import { useTranslation } from "react-i18next";
import styles from "./ShowDiffModal.module.scss";
import { Strikethrough } from "produkter/diff/Strikethrough";

export const SeriesDiff = ({ seriesDiff }: { seriesDiff: DifferenceDTO }) => {
  const { t } = useTranslation();

  if (!seriesDiff) {
    return <BodyShort>Ingen endringer på serie</BodyShort>;
  }
  if (seriesDiff.status === "NO_DIFF") {
    return <BodyShort>Ingen endringer på serie</BodyShort>;
  } else {
    return (
      <VStack gap="2">
        <Heading size="xsmall">Endringer i serie</Heading>
        {Object.entries(seriesDiff.diff.entriesDiffering).length > 0 && (
          <VStack gap="3">
            {Object.entries(seriesDiff.diff.entriesDiffering).map(
              ([key, value], index) =>
                key !== "seriesData.media" && (
                  <VStack gap="2" key={index} className={styles.changeRow}>
                    <BodyShort weight="semibold">{t(key)}</BodyShort>
                    <Box>
                      <VStack gap="1">
                        <Box padding="2" background="surface-danger-subtle" className={styles.previous}>
                          <Strikethrough>{arrayCheck(value.second)}</Strikethrough>
                        </Box>
                        <Box padding="2" background="surface-success-subtle" className={styles.current}>
                          {arrayCheck(value.first)}
                        </Box>
                      </VStack>
                    </Box>
                  </VStack>
                ),
            )}
          </VStack>
        )}
        {Object.entries(seriesDiff.diff.entriesOnlyOnLeft).length > 0 && (
          <VStack gap="3">
            <BodyShort>Nye verdier: </BodyShort>
            {Object.entries(seriesDiff.diff.entriesOnlyOnLeft).map(
              ([key, value], index) =>
                key !== "seriesData.media" && (
                  <VStack gap="2" key={index} className={styles.changeRow}>
                    <BodyShort weight="semibold">{t(key)}</BodyShort>
                    <Box>
                      <VStack gap="1">
                        <Box padding="2" background="surface-success-subtle" className={styles.current}>
                          {arrayCheck(value)}
                        </Box>
                      </VStack>
                    </Box>
                  </VStack>
                ),
            )}
          </VStack>
        )}
        {Object.entries(seriesDiff.diff.entriesOnlyOnRight).length > 0 && (
          <VStack gap="3">
            <BodyShort>Slettede verdier: </BodyShort>
            {Object.entries(seriesDiff.diff.entriesOnlyOnRight).map(
              ([key, value], index) =>
                key !== "seriesData.media" && (
                  <VStack gap="2" key={index} className={styles.changeRow}>
                    <BodyShort weight="semibold">{t(key)}</BodyShort>
                    <Box>
                      <VStack gap="1">
                        <Box padding="2" background="surface-danger-subtle" className={styles.current}>
                          <Strikethrough>{value as string}</Strikethrough>
                        </Box>
                      </VStack>
                    </Box>
                  </VStack>
                ),
            )}
          </VStack>
        )}
        {Object.entries(seriesDiff.diff.entriesDiffering).find(([key]) => key === "seriesData.media") && (
          <Box>
            <VStack gap="1">
              <div className={styles.changeRow}>Det finnes endringer i bilde, dokumenter og/eller videoer.</div>
            </VStack>
          </Box>
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
