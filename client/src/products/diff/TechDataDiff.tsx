import { Avstand } from 'felleskomponenter/Avstand'
import styles from 'products/diff/ShowDiffModal.module.scss'
import { Strikethrough } from 'products/diff/Strikethrough'
import { getTechDataDiff } from 'products/diff/diff-util'
import { DifferenceDTO } from 'utils/types/response-types'

import { BodyShort, Box, HStack, VStack } from '@navikt/ds-react'

export const TechDataDiff = ({ diffDto }: { diffDto: DifferenceDTO }) => {
  if (!diffDto.diff.entriesDiffering['productData.techData']) {
    return <></>
  }
  const techDataDiff = getTechDataDiff(diffDto)
  return (
    <VStack gap="space-8">
      <Avstand />
      <VStack gap="space-16">
        {techDataDiff.map(({ oldData, newData }, i) => (
          <>
            {oldData.value.toLowerCase() !== newData.value.toLowerCase() && (
              <VStack>
                <BodyShort>
                  <>{oldData.key}</>
                </BodyShort>
                <HStack>
                  <Box padding="space-8" background="danger-soft" className={styles.previous}>
                    <Strikethrough>{oldData.value}</Strikethrough>
                  </Box>
                  <Box padding="space-8" background="success-soft" className={styles.previous}>
                    <>{newData.value}</>
                  </Box>
                </HStack>
              </VStack>
            )}
          </>
        ))}
      </VStack>
    </VStack>
  )
}
