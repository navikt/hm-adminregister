import { Alert, BodyLong, Heading, Loader } from '@navikt/ds-react'
import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { beløp } from '../beløp'
import { Avstand } from '../components/Avstand'
import { Data } from '../components/Data'
import { Datum } from '../components/Datum'
import { LenkeMedLogging } from '../components/LenkeMedLogging'
import { LoaderContainer } from '../components/LoaderContainer'
import { organisasjonsnummer } from '../components/organisasjonsnummer'
import { dato } from '../dato'
import { useApplicationContext } from '../state/ApplicationContext'
import { SatsType, VilkårsgrunnlagRequest, VilkårsgrunnlagResponse, VilkårsgrunnlagResultat } from '../types'
import { usePost } from '../usePost'
import { digihot_customevents, logCustomEvent, logSkjemavalideringFeilet } from '../utils/amplitude'
import { FormatertStyrke } from './FormatertStyrke'
import { KravSteg } from './KravSteg'
import { SendInnKrav } from './SendInnKrav'
import { format, formatISO } from 'date-fns'

export function KravOppsummering() {
  const { t } = useTranslation()
  const { appState } = useApplicationContext()
  const {
    post: vurderVilkår,
    data: vilkårsvurdering,
    loading: vilkårsvurderingLoading,
  } = usePost<VilkårsgrunnlagRequest, VilkårsgrunnlagResponse>('/vilkarsgrunnlag')

  const vilkårsgrunnlag: VilkårsgrunnlagRequest = {
    orgnr: appState.orgnr,
    orgNavn: appState.orgNavn, // todo fjern
    fnrBarn: appState.barnFnr,
    brilleseddel: appState.brillestyrke,
    bestillingsdato: formatISO(appState.bestillingsdato!!, { representation: 'date' }),
    brillepris: beløp.byttDesimaltegn(appState.brillepris),
    extras: {
      orgNavn: appState.orgNavn,
      bestillingsreferanse: appState.bestillingsreferanse,
    },
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    // noinspection JSIgnoredPromiseFromCall
    vurderVilkår(vilkårsgrunnlag)
  }, [])

  if (vilkårsvurderingLoading) {
    return (
      <LoaderContainer>
        <Avstand paddingBottom={5} paddingTop={5}>
          <Loader />
        </Avstand>
      </LoaderContainer>
    )
  }
  if (!vilkårsvurdering) {
    return null
  }

  const kanSøke = vilkårsvurdering.resultat === VilkårsgrunnlagResultat.JA || window.appSettings.MILJO === 'dev-gcp'

  logCustomEvent(digihot_customevents.VILKÅRSVURDERING_RESULTAT, { kanSøke: kanSøke })
  if (!kanSøke) {
    logSkjemavalideringFeilet(['Barnet oppfyller ikke vilkårene for å sende inn krav om direkte oppgjør.'])
  }

  return (
    <KravSteg>
      <Heading level="2" size="medium">
        {t('krav.overskrift_barn')}
      </Heading>
      <Data>
        <Datum label="krav.ledetekst_fnr">{appState.barnFnr}</Datum>
        <Datum label="krav.ledetekst_navn">{appState.barnNavn}</Datum>
        <Datum label="krav.ledetekst_alder">{appState.barnAlder}</Datum>
      </Data>
      <Heading level="2" size="medium">
        {t('krav.overskrift_brillestyrke')}
      </Heading>
      <Data>
        <Datum label="krav.ledetekst_høyre_sfære">
          <FormatertStyrke verdi={appState.brillestyrke.høyreSfære} type="sfære" />
        </Datum>
        <Datum label="krav.ledetekst_høyre_sylinder">
          <FormatertStyrke verdi={appState.brillestyrke.høyreSylinder} type="sylinder" />
        </Datum>
        <Datum label="krav.ledetekst_venstre_sfære">
          <FormatertStyrke verdi={appState.brillestyrke.venstreSfære} type="sfære" />
        </Datum>
        <Datum label="krav.ledetekst_venstre_sylinder">
          <FormatertStyrke verdi={appState.brillestyrke.venstreSylinder} type="sylinder" />
        </Datum>
      </Data>
      <Heading level="2" size="medium">
        {t('krav.overskrift_annet')}
      </Heading>
      <Data>
        <Datum label="krav.ledetekst_orgnr">{organisasjonsnummer(appState.orgnr)}</Datum>
        <Datum label="krav.ledetekst_orgnavn">{appState.orgNavn}</Datum>
        <Datum label="krav.ledetekst_bestillingsdato_alt">{format(appState.bestillingsdato!!, 'dd.MM.yyyy')}</Datum>
        <Datum label="krav.ledetekst_brillepris_alt">{appState.brillepris}</Datum>
        <Datum label="krav.ledetekst_bestillingsreferanse">{appState.bestillingsreferanse}</Datum>
      </Data>
      <Avstand paddingBottom={5} paddingTop={5}>
        {vilkårsvurdering.sats === SatsType.INGEN && !vilkårsvurdering.kravFraFørFraInnsender ? (
          <Alert variant="warning">
            <BodyLong>
              <Trans t={t} i18nKey="krav.barn_oppfyller_ikke">
                <></>
                <LenkeMedLogging href="https://nav.no/briller-til-barn#hvem" target="_blank">
                  <></>
                </LenkeMedLogging>
              </Trans>
            </BodyLong>
            <br />
            <BodyLong>
              <Trans t={t} i18nKey="krav.nav_jobber_med_manuell">
                <></>
                <LenkeMedLogging href="https://www.nav.no/fyllut/nav100734" target="_blank">
                  <></>
                </LenkeMedLogging>
              </Trans>
            </BodyLong>
          </Alert>
        ) : vilkårsvurdering.sats === SatsType.INGEN && vilkårsvurdering.kravFraFørFraInnsender ? (
          <Alert variant="warning">
            <BodyLong>{t('krav.allerede_sendt', { aar: appState.bestillingsdato!!.getFullYear() })}</BodyLong>
            <br />
            <BodyLong>
              {t('krav.allerede_sendt_referanse', { referanse: vilkårsvurdering.kravFraFørFraInnsender })}
            </BodyLong>
          </Alert>
        ) : (
          <Alert variant="info">
            <Heading level="2" spacing size="small">
              {t('krav.brillestøtte_beløp_alt', { satsBeløp: beløp.formater(vilkårsvurdering.beløp) })}
            </Heading>
            {Number(vilkårsvurdering.beløp) < vilkårsvurdering.satsBeløp ? (
              <BodyLong>{t('krav.brillestøtte_for_hele_brillen')}</BodyLong>
            ) : (
              <BodyLong>
                <Trans
                  t={t}
                  i18nKey="krav.brillestøtte_sats"
                  values={{
                    sats: vilkårsvurdering.sats.replace('SATS_', ''),
                    satsBeskrivelse: vilkårsvurdering.satsBeskrivelse,
                  }}
                ></Trans>
              </BodyLong>
            )}
            <br />
            <Trans t={t} i18nKey="krav.annen_ordning_info">
              <></>
              <LenkeMedLogging
                href="https://www.nav.no/no/person/hjelpemidler/hjelpemidler-og-tilrettelegging/hjelpemidler/syn"
                target="_blank"
              >
                <></>
              </LenkeMedLogging>
            </Trans>
          </Alert>
        )}
      </Avstand>
      {kanSøke && <SendInnKrav vilkårsgrunnlag={vilkårsgrunnlag} />}
    </KravSteg>
  )
}
