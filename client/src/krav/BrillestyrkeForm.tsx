import { Alert, BodyLong, Heading } from '@navikt/ds-react'
import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { beløp } from '../beløp'
import { Avstand } from '../components/Avstand'
import { SatsType } from '../types'
import { logSkjemavalideringFeilet } from '../utils/amplitude'
import { useBeregning } from './useBeregning'
import { Øye } from './Øye'

export function BrillestyrkeForm() {
  const { t } = useTranslation()
  const beregning = useBeregning()

  const vilkårOmStyrkeIkkeOppfylt = t('krav.vilkår_brillestyrke_ikke_oppfylt')
  useEffect(() => {
    if (beregning && beregning.sats === SatsType.INGEN) {
      logSkjemavalideringFeilet([vilkårOmStyrkeIkkeOppfylt])
    }
  }, [beregning])

  return (
    <>
      <Avstand paddingBottom={5} paddingTop={5}>
        <Heading level="2" size="medium">
          {t('krav.overskrift_brillestyrke')}
        </Heading>
        <BodyLong>{t('krav.forklaring_brillestyrke')}</BodyLong>
        <Øye type="høyre" />
        <Øye type="venstre" />
      </Avstand>
      {beregning && (
        <Avstand paddingBottom={5} paddingTop={5}>
          {beregning.sats === SatsType.INGEN ? (
            <Alert variant="warning">
              <BodyLong>{vilkårOmStyrkeIkkeOppfylt}</BodyLong>
            </Alert>
          ) : (
            <Alert variant="info" role="alert">
              <Heading level="2" spacing size="small">
                {t('krav.brillestøtte_beløp', { satsBeløp: beløp.formater(beregning.satsBeløp) })}
              </Heading>
              <BodyLong>
                <Trans
                  t={t}
                  i18nKey="krav.brillestøtte_sats"
                  values={{
                    sats: beregning.sats.replace('SATS_', ''),
                    satsBeskrivelse: beregning.satsBeskrivelse,
                  }}
                ></Trans>
              </BodyLong>
            </Alert>
          )}
        </Avstand>
      )}
    </>
  )
}
