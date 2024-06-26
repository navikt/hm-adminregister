import { DifferenceDTO } from "utils/types/response-types";
import { getTechDataDiff } from "produkter/diff/diff-util";
import { BodyShort, Box, HStack, VStack } from "@navikt/ds-react";
import styles from "produkter/diff/ShowDiffModal.module.scss";
import { Strikethrough } from "produkter/diff/Strikethrough";
import { Avstand } from "felleskomponenter/Avstand";

export const TechDataDiff = ({ diffDto }: { diffDto: DifferenceDTO }) => {
  if (!diffDto.diff.entriesDiffering["productData.techData"]) {
    return <></>;
  }
  const techDataDiff = getTechDataDiff(diffDto);
  return (
    <VStack gap="2">
      <Avstand />
      <VStack gap="3">
        {techDataDiff.map(({ oldData, newData }, i) => (
          <VStack key={i}>
            <BodyShort>
              <>{oldData.key}</>
            </BodyShort>
            <HStack>
              <Box padding="2" background="surface-danger-subtle" className={styles.previous}>
                <Strikethrough>{oldData.value}</Strikethrough>
              </Box>
              <Box padding="2" background="surface-success-subtle" className={styles.previous}>
                <>{newData.value}</>
              </Box>
            </HStack>
          </VStack>
        ))}
      </VStack>
    </VStack>
  );
};
