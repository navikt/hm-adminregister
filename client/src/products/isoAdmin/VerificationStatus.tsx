import { BodyShort, Box, ExpansionCard, HStack, ProgressBar, Switch, VStack } from '@navikt/ds-react'

type Progress = { total: number; verified: number; percentage: number }

const VerificationStatus = ({
  progress,
  open,
  onToggle,
}: {
  progress: Progress & { groups: (Progress & { prefix: string })[] }
  open: boolean
  onToggle: (open: boolean) => void
}) => (
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
        <VStack gap="space-8">
          {progress.total > 0 && (
            <>
              <BodyShort size="small" role="status" aria-live="polite">
                {progress.verified.toLocaleString('nb-NO')} av {progress.total.toLocaleString('nb-NO')} verifisert (
                {progress.percentage} %)
              </BodyShort>
              <BodyShort size="small" textColor="subtle">
                Gjelder alle mappinger, uavhengig av filter. Verifisering kobler ikke produkter til v22.
              </BodyShort>
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
                          {group.verified.toLocaleString('nb-NO')} av {group.total.toLocaleString('nb-NO')} verifisert (
                          {group.percentage} %)
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
        </VStack>
      </Box>
    )}
  </VStack>
)

export default VerificationStatus
