import { DifferenceDTO } from "utils/types/response-types";
import { getTechDataDiff } from "products/diff/diff-util";
import { BodyShort, Box, HStack, VStack } from "@navikt/ds-react";
import styles from "products/diff/ShowDiffModal.module.scss";
import { Strikethrough } from "products/diff/Strikethrough";
import { Avstand } from "felleskomponenter/Avstand";

export const TechDataDiff = ({ diffDto }: { diffDto: DifferenceDTO }) => {
  if (!diffDto.diff.entriesDiffering["productData.techData"]) {
    return <></>;
  }
  const techDataDiff = getTechDataDiff(diffDto);
  return (
    <VStack gap="space-2">
      <Avstand />
      <VStack gap="space-4">
        {techDataDiff.map(({ oldData, newData }, i) => (
          <>
            {oldData.value.toLowerCase() !== newData.value.toLowerCase() && (
              <VStack>
                <BodyShort>
                  <>{oldData.key}</>
                </BodyShort>
                <HStack>
                  <Box padding="space-2" background="danger-soft" className={styles.previous}>
                    <Strikethrough>{oldData.value}</Strikethrough>
                  </Box>
                  <Box padding="space-2" background="success-soft" className={styles.previous}>
                    <>{newData.value}</>
                  </Box>
                </HStack>
              </VStack>
            )}
          </>
        ))}
      </VStack>
    </VStack>
  );
};
