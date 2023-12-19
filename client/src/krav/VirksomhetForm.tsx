import { BodyLong, Button, Heading } from '@navikt/ds-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Avstand } from '../components/Avstand'
import { organisasjonsnummer } from '../components/organisasjonsnummer'
import { Tekstfelt } from '../components/Tekstfelt'
import { http } from '../http'
import { useApplicationContext } from '../state/ApplicationContext'
import { Virksomhet as VirksomhetType, VirksomhetResponse } from '../types'
import { Virksomhet } from './Virksomhet'

interface TidligereBrukteVirksomheterProps {
  tidligereBrukteVirksomheter?: VirksomhetType[]
}

export function VirksomhetForm(props: TidligereBrukteVirksomheterProps) {
  const { t } = useTranslation()
  const [virksomhet, setVirksomhet] = useState<VirksomhetResponse | null>(null)
  const [orgnr, setOrgnr] = useState('')
  const { setAppState } = useApplicationContext()
  const { tidligereBrukteVirksomheter } = props
  const velgVirksomhet = (virksomhet: VirksomhetResponse) =>
    setAppState((prev) => ({
      ...prev,
      orgnr: virksomhet.orgnr,
      orgNavn: virksomhet.navn,
    }))

  return (
    <>
      <form role="search" onSubmit={(e) => e.preventDefault()} autoComplete="off">
        <SøkContainer>
          <Tekstfelt
            label={t('krav.ledetekst_orgnr')}
            size="medium"
            hideLabel={false}
            value={orgnr}
            onChange={(e) => setOrgnr(e.target.value)}
          />
          <Button
            onClick={async () => {
              const orgnrUtenMellomrom = orgnr.replaceAll(' ', '').trim()
              const virksomhet: VirksomhetResponse = await http.get(`/virksomheter/${orgnrUtenMellomrom}`)
              if (virksomhet !== null) {
                setVirksomhet(virksomhet)
              }
            }}
            variant="secondary"
          >
            {t('krav.knapp_slå_opp')}
          </Button>
        </SøkContainer>
      </form>

      {virksomhet && (
        <Avstand paddingTop={5}>
          <Virksomhet virksomhet={virksomhet} onLagre={velgVirksomhet} />
        </Avstand>
      )}
      {tidligereBrukteVirksomheter && tidligereBrukteVirksomheter?.length > 0 && (
        <Avstand marginTop={7}>
          <Heading level="3" size="small" spacing>
            {t('krav.tidligere_brukte_virksomheter')}
          </Heading>
          {tidligereBrukteVirksomheter.map((it) => (
            <VirksomhetPanel key={it.orgnr}>
              <Button variant="tertiary" type="button" onClick={() => velgVirksomhet(it)}>
                {t('krav.knapp_bruk')}
              </Button>
              <BodyLong>{`${organisasjonsnummer(it.orgnr)} ${it.navn}`}</BodyLong>
            </VirksomhetPanel>
          ))}
        </Avstand>
      )}
    </>
  )
}

export const VirksomhetPanel = styled.div`
  display: flex;
  align-items: center;
  gap: var(--a-spacing-5);
`

const SøkContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--a-spacing-3);
  align-items: flex-end;
`
