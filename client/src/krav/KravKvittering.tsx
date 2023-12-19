import { Alert, BodyLong, Button, Heading } from '@navikt/ds-react'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'
import styled from 'styled-components'
import { Avstand } from '../components/Avstand'
import { Beløp } from '../components/Beløp'
import { Data } from '../components/Data'
import { Dato } from '../components/Dato'
import { Datum } from '../components/Datum'
import { hotjar_event, HotjarTrigger } from '../components/hotjar-trigger'
import { LenkeMedLogging } from '../components/LenkeMedLogging'
import { organisasjonsnummer } from '../components/organisasjonsnummer'
import ScrollToTop from '../components/ScrollToTop'
import { baseUrl } from '../http'
import { useApplicationContext } from '../state/ApplicationContext'
import { OpprettKravResponse } from '../types'
import { useLocationState } from '../useLocationState'
import { logPrintKvitteringÅpnet } from '../utils/amplitude'
import { KravSteg } from './KravSteg'
import { PrinterSmallIcon } from '@navikt/aksel-icons'

export function KravKvittering() {
  const { t } = useTranslation()
  const { resetAppState } = useApplicationContext()
  const state = useLocationState<OpprettKravResponse>()

  HotjarTrigger({ timeout: 500 }, hotjar_event.KVITTERING)

  useEffect(() => {
    resetAppState()
  }, [])

  if (!state) {
    return null
  }

  const { id, orgnr, bestillingsreferanse, beløp, bestillingsdato, opprettet } = state

  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforePrint: () => logPrintKvitteringÅpnet(),
    documentTitle: `kvittering_${bestillingsreferanse}`,
  })

  return (
    <div ref={printRef}>
      <KravSteg>
        <ScrollToTop />
        <Alert variant="success">{t('krav.kravet_er_registrert')}</Alert>
        <Avstand marginBottom={5} />
        <BodyLong spacing>{t('krav.kravet_er_registrert_forklaring')}</BodyLong>
        <Heading level="2" size="medium">
          {t('krav.overskrift_kvittering')}
        </Heading>
        <Data>
          <Datum label="krav.ledetekst_orgnr">{organisasjonsnummer(orgnr)}</Datum>
          <Datum label="krav.ledetekst_opprettet_dato">
            <Dato verdi={opprettet}></Dato>
          </Datum>
          <Datum label="krav.ledetekst_bestilling_dato">
            <Dato verdi={bestillingsdato}></Dato>
          </Datum>
          <Datum label="krav.ledetekst_beløp_til_utbetaling">
            <Beløp verdi={beløp} />
          </Datum>
          <Datum label="krav.ledetekst_deres_referansenr">{bestillingsreferanse}</Datum>
          <Datum label="krav.ledetekst_navs_referansenr">{id}</Datum>
        </Data>
        <Knapperad>
          <Button variant="secondary" onClick={handlePrint} icon={<PrinterSmallIcon aria-hidden />}>
            {t('krav.knapp_skriv_ut_kvittering')}
          </Button>
          <LenkeMedLogging href={baseUrl('/')}>{t('krav.lenke_til_forsiden')}</LenkeMedLogging>
        </Knapperad>
      </KravSteg>
    </div>
  )
}

const Knapperad = styled.div`
  display: flex;
  gap: var(--a-spacing-4);
  @media print {
    display: none;
  }
`
