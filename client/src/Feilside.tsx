import { Button, BodyShort, Heading, ReadMore, Link } from '@navikt/ds-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { AppLink } from './components/AppLink'
import { Avstand } from './components/Avstand'
import { hentUtviklerinformasjon } from './error'
import { useNavigate } from 'react-router-dom'

export interface FeilsideProps {
  status: number
  error?: Error
  erInnsendingFeil?: Boolean
}

export function Feilside(props: FeilsideProps) {
  const { status, error, erInnsendingFeil } = props
  const { t } = useTranslation()
  const utviklerinformasjon = hentUtviklerinformasjon(error)
  return (
    <main>
      <Avstand paddingLeft={3} paddingRight={3}>
        <Heading level="1" size="large" spacing>
          {t(
            overskrift[status] ||
              (erInnsendingFeil === true
                ? 'feilside.feil.teknisk_feil_innsending.tittel'
                : 'feilside.feil.teknisk_feil.tittel')
          )}
        </Heading>
        <Avstand marginTop={8}>
          {{
            401: <IkkeLoggetInn />,
            404: <IkkeFunnet />,
          }[status] || <TekniskFeil erInnsendingFeil={erInnsendingFeil} />}
        </Avstand>
      </Avstand>
      {utviklerinformasjon && (
        <Avstand marginTop={12} paddingLeft={2} paddingRight={2}>
          <ReadMore header={t('feilside.informasjon_til_utviklere.tittel')} defaultOpen={true}>
            <Code>
              {t('feilside.informasjon_til_utviklere.datotid')}: {new Date().toISOString()}.{'\n'}
              {t('feilside.informasjon_til_utviklere.status')}: {status}.{'\n'}
              {utviklerinformasjon}
            </Code>
          </ReadMore>
        </Avstand>
      )}
    </main>
  )
}

function IkkeLoggetInn() {
  const { t } = useTranslation()
  return (
    <>
      <BodyShort spacing>{t('feilside.feil.ikke_logget_inn.beskrivelse')}</BodyShort>
      <Avstand marginTop={6}>
        <BodyShort spacing>
          <AppLink href="/">{t('feilside.gå_til_innloggingssiden')}</AppLink>
        </BodyShort>
      </Avstand>
    </>
  )
}

function IkkeFunnet() {
  const { t } = useTranslation()
  return (
    <>
      <BodyShort spacing>{t('feilside.feil.ikke_funnet.beskrivelse')}</BodyShort>
      <Avstand marginTop={6}>
        <BodyShort spacing>
          <AppLink href="/">{t('feilside.gå_til_forsiden')}</AppLink>
        </BodyShort>
      </Avstand>
    </>
  )
}

function TekniskFeil({ erInnsendingFeil }: { erInnsendingFeil?: Boolean }) {
  const { t } = useTranslation()
  return (
    <>
      <BodyShort spacing>
        {t(
          erInnsendingFeil
            ? 'feilside.feil.teknisk_feil_innsending.beskrivelse'
            : 'feilside.feil.teknisk_feil.beskrivelse'
        )}
      </BodyShort>
      <Avstand marginTop={8}>
        <BodyShort spacing>
          <Link
            href="https://www.nav.no/no/nav-og-samfunn/kontakt-nav/kontorer/nav-hjelpemiddelsentral-agder"
            target="_blank"
          >
            {t('feilside.ta_kontakt_agder')}
          </Link>
        </BodyShort>
      </Avstand>
      <KnappTilForsiden />
    </>
  )
}

function KnappTilForsiden() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  return (
    <Avstand marginTop={10}>
      <Button
        onClick={() => {
          navigate('/')
          /* reload page after changing href: */ navigate(0)
        }}
      >
        {t('feilside.gå_til_forsiden')}
      </Button>
    </Avstand>
  )
}

const overskrift: Record<number, string> = {
  401: 'feilside.feil.ikke_logget_inn.tittel',
  404: 'feilside.feil.ikke_funnet.tittel',
}

const Feilkode = styled.small`
  font-weight: normal;
`

const Code = styled.pre`
  white-space: pre-wrap;
  font-size: 75%;
`
