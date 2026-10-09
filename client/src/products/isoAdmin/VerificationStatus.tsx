import { BodyShort, Box, ExpansionCard, HStack, InfoCard, ProgressBar, Switch, VStack } from '@navikt/ds-react'

type Progress = { total: number; verified: number; percentage: number }
type LevelProgress = Progress & { level: number; hiddenUnverified: number }

const levelLabel = (level: number) => (level ? `v16 nivå ${level}` : 'Uten v16-kode (ny v22-kode)')

const VerificationStatus = ({
  progress,
  open,
  onToggle,
  showHierarchy,
}: {
  progress: Progress & { levels: LevelProgress[]; groups: (Progress & { prefix: string })[] }
  open: boolean
  onToggle: (open: boolean) => void
  showHierarchy: boolean
}) => {
  const hiddenUnverified = showHierarchy ? 0 : progress.levels.reduce((sum, level) => sum + level.hiddenUnverified, 0)
  return (
    <VStack gap="space-8">
      <HStack gap="space-16" align="center" justify="end">
        <BodyShort size="small" textColor="subtle" role="status" aria-live="polite">
          {progress.total ? `Verifiserte ISO-mappinger: ${progress.percentage} %` : 'Ingen mappinger'}
        </BodyShort>
        {progress.total > 0 && (
          <Box width="8rem">
            <ProgressBar size="small" value={progress.percentage} aria-label="Verifiserte ISO-mappinger" />
          </Box>
        )}
        <Switch
          size="small"
          data-color="neutral"
          checked={open}
          onChange={(event) => onToggle(event.target.checked)}
          aria-controls="iso-verification-details"
          aria-expanded={open}
        >
          <BodyShort as="span" size="small" textColor="subtle">
            Vis detaljer
          </BodyShort>
        </Switch>
      </HStack>
      {open && (
        <Box
          id="iso-verification-details"
          as="section"
          aria-label="Verifiseringsstatus"
          background="neutral-soft"
          padding="space-12"
          borderRadius="8"
        >
            {progress.total > 0 && (
              <>
                <InfoCard>
                  <InfoCard.Content>
                    <VStack gap="space-24">
                    <VStack gap="space-8">
                    <BodyShort size="small" role="status" aria-live="polite">
                      {progress.verified.toLocaleString('nb-NO')} av {progress.total.toLocaleString('nb-NO')} verifisert (
                      {progress.percentage} %)
                    </BodyShort>
                    <BodyShort size="small" textColor="subtle">
                      Gjelder alle mappinger, uavhengig av filter. Verifisering kobler ikke produkter til v22.
                    </BodyShort>
                    {hiddenUnverified > 0 && (
                      <BodyShort size="small">
                        {hiddenUnverified.toLocaleString('nb-NO')} ikke-verifiserte mappinger ligger over nivå 4 og vises
                        ikke i tabellen nå. Slå på «Vis ISO-struktur» for å se dem.
                      </BodyShort>
                    )}
                    </VStack>
                    <VStack
                      gap="space-8"
                      as="ul"
                      aria-label="Verifisering per nivå"
                      style={{ listStyle: 'none', padding: 0, margin: 0 }}
                    >
                      {progress.levels.map((level) => (
                        <VStack as="li" key={level.level} gap="space-4">
                          <BodyShort size="small">
                            {levelLabel(level.level)}: {level.verified.toLocaleString('nb-NO')} av{' '}
                            {level.total.toLocaleString('nb-NO')} verifisert ({level.percentage} %)
                          </BodyShort>
                          <ProgressBar
                            size="small"
                            value={level.percentage}
                            aria-label={`Verifiserte mappinger for ${levelLabel(level.level)}`}
                          />
                        </VStack>
                      ))}
                    </VStack>
                    </VStack>
                  </InfoCard.Content>
                </InfoCard>


                <ExpansionCard size="small" aria-label="Verifisering per v16 nivå 1">
                  <ExpansionCard.Header>
                    <ExpansionCard.Title size="small">Verifisering per v16 nivå 1</ExpansionCard.Title>
                  </ExpansionCard.Header>
                  <ExpansionCard.Content>
                    <VStack gap="space-12">
                      {progress.groups.map((group) => (
                        <VStack key={group.prefix} gap="space-4">
                          <BodyShort size="small">
                            {group.prefix ? `ISO ${group.prefix}` : 'Uten v16-kode'}:{' '}
                            {group.verified.toLocaleString('nb-NO')} av {group.total.toLocaleString('nb-NO')} verifisert
                            ({group.percentage} %)
                          </BodyShort>
                          <ProgressBar
                            size="small"
                            value={group.percentage}
                            aria-label={
                              group.prefix
                                ? `Verifiserte mappinger for ISO ${group.prefix}`
                                : 'Verifiserte mappinger uten v16-kode'
                            }
                          />
                        </VStack>
                      ))}
                    </VStack>
                  </ExpansionCard.Content>
                </ExpansionCard>
              </>
            )}
        </Box>
      )}
    </VStack>
  )
}

export default VerificationStatus
