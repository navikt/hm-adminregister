import { DifferenceDTO } from "utils/types/response-types";
import { BodyShort, Box, Heading, VStack } from "@navikt/ds-react";
import { useTranslation } from "react-i18next";
import styles from "./ShowDiffModal.module.scss";
import { Strikethrough } from "products/diff/Strikethrough";
import { getMediaDiff } from "products/diff/diff-util";

export const SeriesDiff = ({ seriesDiff }: { seriesDiff: DifferenceDTO }) => {
  const { t } = useTranslation();

  const changedFields = Object.entries(seriesDiff.diff.entriesDiffering).filter(([key]) => key !== "seriesData.media");

  const mediaDiff = getMediaDiff(seriesDiff);
  const newFields = Object.entries(seriesDiff.diff.entriesOnlyOnLeft);
  const deletedFields = Object.entries(seriesDiff.diff.entriesOnlyOnRight);

  if (!seriesDiff || seriesDiff.status === "NO_DIFF") {
    return <BodyShort>Ingen endringer i felles produktinformasjon</BodyShort>;
  }

  return (
    <VStack gap="2">
      <Heading size="xsmall">Endringer i felles produktinformasjon</Heading>
      {changedFields.length > 0 && (
        <VStack gap="3">
          {changedFields.map(
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
      {newFields.length > 0 && (
        <VStack gap="3">
          <BodyShort>Nye verdier: </BodyShort>
          {newFields.map(
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
      {deletedFields.length > 0 && (
        <VStack gap="3">
          <BodyShort>Slettede verdier: </BodyShort>
          {deletedFields.map(
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
      {(mediaDiff.videoChanges || mediaDiff.documentChanges || mediaDiff.videoChanges) && (
        <Box>
          <VStack gap="1">
            {mediaDiff.imageChanges && (
              <div className={styles.changeRow}>
                Det finnes endringer i <b>bilder</b>.
              </div>
            )}
            {mediaDiff.documentChanges && (
              <div className={styles.changeRow}>
                Det finnes endringer i <b>dokumenter</b>.
              </div>
            )}
            {mediaDiff.videoChanges && (
              <div className={styles.changeRow}>
                Det finnes endringer i <b>videoer</b>.
              </div>
            )}
          </VStack>
        </Box>
      )}
    </VStack>
  );
};

const arrayCheck = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((val, i) => <span key={i}> {val as string} </span>);
  } else {
    return <span>{value as string}</span>;
  }
};
