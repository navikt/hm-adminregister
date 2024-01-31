import { Avstand } from './Avstand'
import { Alert, AlertProps, ExpansionCard } from '@navikt/ds-react'

interface FeilmeldingInterface {
  variant?: AlertProps['variant']
  feilmelding: React.ReactNode
  tekniskFeilmelding?: string
}

interface Props {
  feilmelding: FeilmeldingInterface
}

const Feilmelding = ({ feilmelding }: Props) => {
  return (
    <Alert variant={feilmelding.variant ?? 'error'} data-cy='feilmelding' role='alert'>
      <>
        {feilmelding.feilmelding}
        {feilmelding.tekniskFeilmelding && (
          <Avstand marginTop={2}>
            <ExpansionCard size='small' aria-label='Small-variant'>
              <ExpansionCard.Header>
                <ExpansionCard.Title size='small'>'error.informasjonForUtviklere'</ExpansionCard.Title>
              </ExpansionCard.Header>
              <ExpansionCard.Content>{JSON.stringify(feilmelding.tekniskFeilmelding)}</ExpansionCard.Content>
            </ExpansionCard>
          </Avstand>
        )}
      </>
    </Alert>
  )
}

export { Feilmelding, type FeilmeldingInterface }
