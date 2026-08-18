import { useTranslation } from 'react-i18next'

import { renderDiffValue } from 'products/diff/renderDiffValue'
import { Strikethrough } from 'products/diff/Strikethrough'
import { getMediaDiff } from 'products/diff/diff-util'
import { DifferenceDTO } from 'utils/types/response-types'

import { BodyShort, Box, Heading, VStack } from '@navikt/ds-react'

import styles from './ShowDiffModal.module.scss'

export const SeriesDiff = ({ seriesDiff }: { seriesDiff: DifferenceDTO }) => {
  const { t } = useTranslation()

  const changedFields = Object.entries(seriesDiff.diff.entriesDiffering).filter(([key]) => key !== 'seriesData.media')

  const mediaDiff = getMediaDiff(seriesDiff)
  const newFields = Object.entries(seriesDiff.diff.entriesOnlyOnLeft)
  const deletedFields = Object.entries(seriesDiff.diff.entriesOnlyOnRight)

  if (!seriesDiff || seriesDiff.status === 'NO_DIFF') {
    return <BodyShort>Ingen endringer i felles produktinformasjon</BodyShort>
  }

  return (
    <VStack gap="space-8">
      <Heading size="xsmall">Endringer i felles produktinformasjon</Heading>
      {changedFields.length > 0 && (
        <VStack gap="space-16">
          {changedFields.map(
            ([key, value], index) =>
              key !== 'seriesData.media' && (
                <VStack gap="space-8" key={index} className={styles.changeRow}>
                  <BodyShort weight="semibold">{t(key)}</BodyShort>
                  <Box>
                    <VStack gap="space-16">
                      <Box padding="space-8" background="danger-soft" className={styles.previous}>
                        <Strikethrough>{renderDiffValue(value.second)}</Strikethrough>
                      </Box>
                      <Box padding="space-8" background="success-soft" className={styles.current}>
                        {renderDiffValue(value.first)}
                      </Box>
                    </VStack>
                  </Box>
                </VStack>
              )
          )}
        </VStack>
      )}
      {newFields.length > 0 && (
        <VStack gap="space-16">
          <BodyShort>Nye verdier: </BodyShort>
          {newFields.map(
            ([key, value], index) =>
              key !== 'seriesData.media' && (
                <VStack gap="space-8" key={index} className={styles.changeRow}>
                  <BodyShort weight="semibold">{t(key)}</BodyShort>
                  <Box>
                    <VStack gap="space-16">
                      <Box padding="space-8" background="success-soft" className={styles.current}>
                        {renderDiffValue(value)}
                      </Box>
                    </VStack>
                  </Box>
                </VStack>
              )
          )}
        </VStack>
      )}
      {deletedFields.length > 0 && (
        <VStack gap="space-16">
          <BodyShort>Slettede verdier: </BodyShort>
          {deletedFields.map(
            ([key, value], index) =>
              key !== 'seriesData.media' && (
                <VStack gap="space-8" key={index} className={styles.changeRow}>
                  <BodyShort weight="semibold">{t(key)}</BodyShort>
                  <Box>
                    <VStack gap="space-16">
                      <Box padding="space-8" background="danger-soft" className={styles.current}>
                        <Strikethrough>{renderDiffValue(value)}</Strikethrough>
                      </Box>
                    </VStack>
                  </Box>
                </VStack>
              )
          )}
        </VStack>
      )}
      {(mediaDiff.videoChanges || mediaDiff.documentChanges || mediaDiff.videoChanges) && (
        <Box>
          <VStack gap="space-16">
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
  )
}
