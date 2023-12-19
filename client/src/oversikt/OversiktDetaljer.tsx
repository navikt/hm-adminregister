import { useParams } from 'react-router-dom'
import ScrollToTop from '../components/ScrollToTop'
import { Button, Panel, Heading, Loader, Alert, Modal, BodyLong, Label, Link } from '@navikt/ds-react'
import React, { useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import {
  logPrintKravÅpnet,
  logSlettKravÅpnet,
  logSlettKravBekreftet,
  logSlettKravAvbrutt,
  logSlettUtbetaltKravEpost,
} from '../utils/amplitude'
import { Data } from '../components/Data'
import { Datum } from '../components/Datum'
import { ReactNode } from 'react'
import { Nullable, OversiktDetaljerResponse, SlettetAvType } from '../types'
import { useGet } from '../useGet'
import styled from 'styled-components'
import { Dato } from '../components/Dato'
import { Knapper } from '../components/Knapper'
import { beløp } from '../beløp'
import { Trans, useTranslation } from 'react-i18next'
import { http } from '../http'
import { PrinterSmallIcon, TrashIcon } from '@navikt/aksel-icons'

export function OversiktDetaljer() {
  let { vedtakId } = useParams()
  const { t } = useTranslation()

  const { data, error } = useGet<OversiktDetaljerResponse>('/oversikt/' + vedtakId)

  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforePrint: () => logPrintKravÅpnet(),
    documentTitle: `krav_${vedtakId}`,
  })

  const [modalSlettButtonDisabled, setModalSlettButtonDisabled] = useState(false)
  const [modalSlettFeil, setModalSlettFeil] = useState(false)
  const slettKrav = async (id: number) => {
    // deaktiver knapp
    setModalSlettButtonDisabled(true)

    // rest-kall for å slette
    const resultat = await http.delete(`/krav/${id}`, {})
    if (resultat.error) {
      // håndtere feil
      console.log('Feil ved sletting av krav:', resultat)
      setModalSlettButtonDisabled(false)
      setModalSlettFeil(true)
      return
    }

    // håndtere ok - refresh siden
    logSlettKravBekreftet()
    setTimeout(() => {
      window.location.reload()
    }, 300)
  }

  const [modalDeleteOpen, setModalDeleteOpen] = useState(false)

  return (
    <div className="gray-background">
      <DontPrintHelper ref={printRef}>
        <ScrollToTop />
        <main>
          {!error && !data && (
            <Loader
              variant="neutral"
              size="3xlarge"
              title={t('oversikt.laster')}
              style={{ display: 'block', margin: '2rem auto' }}
            />
          )}
          {!error && data && (
            <>
              <Heading
                level="1"
                size="large"
                style={{ display: 'inline-block', marginRight: '1rem', margin: '0.1em 0' }}
              >
                {t('oversikt.krav_detaljer.overskrift')} {data.barnsNavn}
              </Heading>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  marginTop: '1rem',
                }}
              >
                <div className="dontPrintMe">
                  <Button
                    icon={<PrinterSmallIcon aria-hidden />}
                    variant="secondary"
                    size="medium"
                    onClick={handlePrint}
                  >
                    {t('oversikt.krav_detaljer.meny.utskrift')}
                  </Button>
                  {!data.slettet && !data.utbetalingsdato && !data.utbetalingsstatus && (
                    <Button
                      icon={<TrashIcon aria-hidden />}
                      variant="tertiary"
                      size="medium"
                      onClick={() => {
                        setModalDeleteOpen(true)
                        logSlettKravÅpnet()
                      }}
                    >
                      {t('oversikt.krav_detaljer.meny.slett')}
                    </Button>
                  )}
                </div>
              </div>
              <Panel border={false} style={{ marginTop: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <Label>{t('oversikt.krav_detaljer.mottatt')}</Label> <Dato verdi={data.opprettet} />
                </div>
                {!data.utbetalingsdato && !data.utbetalingsstatus && !data.slettet && (
                  <Alert variant="info" size="medium" fullWidth style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    {t('oversikt.utbetalingsstatus.ikke_utbetalt')}
                  </Alert>
                )}
                {data.slettet && (
                  <Alert variant="warning" size="medium" fullWidth style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    {data.slettetAvType === SlettetAvType.INNSENDER
                      ? t('oversikt.utbetalingsstatus.slettet.innsender')
                      : t('oversikt.utbetalingsstatus.slettet.nav_admin')}{' '}
                    <Dato verdi={data.slettet} />.
                  </Alert>
                )}
                {!data.slettet && data.utbetalingsdato && (
                  <Alert variant="success" size="medium" fullWidth style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    {t('oversikt.utbetalingsstatus.utbetalt')} <Dato verdi={data.utbetalingsdato} />.
                  </Alert>
                )}
                {!data.slettet && !data.utbetalingsdato && data.utbetalingsstatus && (
                  <Alert variant="info" size="medium" fullWidth style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    {t('oversikt.utbetalingsstatus.utbetales')}
                  </Alert>
                )}
                <div style={{ marginTop: '2rem' }}>
                  <Heading level="2" size="medium">
                    {t('krav.overskrift_foretaket')}
                  </Heading>
                  <Data>
                    <DatumHelper label={t('krav.ledetekst_orgnavn')}>{data.orgnavn}</DatumHelper>
                    <DatumHelper label={t('krav.ledetekst_orgnr')}>{data.orgnr}</DatumHelper>
                  </Data>
                  <Line />
                </div>
                <div style={{ marginTop: '2rem' }}>
                  <Heading level="2" size="medium">
                    {t('krav.overskrift_barn')}
                  </Heading>
                  <Data>
                    <DatumHelper label={t('krav.ledetekst_navn')}>{data.barnsNavn}</DatumHelper>
                    <DatumHelper label={t('krav.ledetekst_fnr')}>{data.barnsFnr}</DatumHelper>
                    <DatumHelper label={t('krav.ledetekst_alder')}>{data.barnsAlder} år</DatumHelper>
                  </Data>
                  <Line />
                </div>
                <div style={{ marginTop: '2rem' }}>
                  <Heading level="2" size="medium">
                    {t('krav.overskrift_brillestyrke')}
                  </Heading>
                  <Data>
                    <DatumHelper label={t('krav.ledetekst_høyre_sfære')}>
                      {data.høyreSfære.toFixed(2).replace('.', ',')}
                    </DatumHelper>
                    <DatumHelper label={t('krav.ledetekst_høyre_sylinder')}>
                      {data.høyreSylinder.toFixed(2).replace('.', ',')}
                    </DatumHelper>
                    <DatumHelper label={t('krav.ledetekst_venstre_sfære')}>
                      {data.venstreSfære.toFixed(2).replace('.', ',')}
                    </DatumHelper>
                    <DatumHelper label={t('krav.ledetekst_venstre_sylinder')}>
                      {data.venstreSylinder.toFixed(2).replace('.', ',')}
                    </DatumHelper>
                  </Data>
                  <Line />
                </div>
                <div style={{ marginTop: '2rem' }}>
                  <Heading level="2" size="medium">
                    {t('krav.overskrift_om_brillen')}
                  </Heading>
                  <Data>
                    <DatumHelper label={t('krav.ledetekst_bestillingsdato_alt')}>
                      <Dato verdi={data.bestillingsdato} />
                    </DatumHelper>
                    <DatumHelper label={t('oversikt.krav_detaljer.ledetekst_krav_innsendt')}>
                      <Dato verdi={data.opprettet} />
                    </DatumHelper>
                    <DatumHelper label={t('krav.ledetekst_brillepris_alt')}>
                      {beløp.formater(data.brillepris)}
                    </DatumHelper>
                    <DatumHelper label={t('krav.ledetekst_bestillingsreferanse')}>
                      {data.bestillingsreferanse}
                    </DatumHelper>
                    <DatumHelper label={t('krav.ledetekst_navs_referansenr')}>{data.id.toString(10)}</DatumHelper>
                  </Data>
                  <Line />
                </div>
                <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                  <Heading level="2" size="medium">
                    {t('oversikt.krav_detaljer.overskrift_om_kravet')}
                  </Heading>
                  <BodyLong spacing>
                    {t('krav.krav_detaljer.om_kravet', {
                      sats: data.satsNr,
                      satsBeskrivelse: data.satsBeskrivelse,
                      satsBeløp: beløp.formater(data.satsBeløp),
                    })}
                  </BodyLong>
                  <Heading level="3" size="small">
                    {t('oversikt.krav_detaljer.krav_om_direkte_oppgjør', {
                      beløp: beløp.formater(data.beløp),
                      orgnavn: data.orgnavn,
                    })}
                  </Heading>
                </div>
              </Panel>
              <Modal
                open={modalDeleteOpen}
                aria-label="Slett krav dialog"
                onClose={() => {
                  setModalDeleteOpen(false)
                  logSlettKravAvbrutt()
                }}
              >
                <Modal.Content>
                  {!data.utbetalingsdato && (
                    <main>
                      <Heading spacing level="1" size="large">
                        {t('oversikt.slett_modal.overskrift')}
                      </Heading>
                      <BodyLong spacing>{t('oversikt.slett_modal.ingress')}</BodyLong>
                      <Heading level="2" size="medium">
                        {t('oversikt.slett_modal.konsekvenser')}
                      </Heading>
                      <ul>
                        <li>{t('oversikt.slett_modal.konsekvenser_beskrivelse1')}</li>
                        <li>
                          {t('oversikt.slett_modal.konsekvenser_beskrivelse2', {
                            år: new Date(data.bestillingsdato).getFullYear(),
                          })}
                        </li>
                        <li>{t('oversikt.slett_modal.konsekvenser_beskrivelse3')}</li>
                      </ul>

                      {modalSlettFeil && (
                        <Alert variant="error" fullWidth style={{ marginBottom: '1rem' }}>
                          {t('oversikt.slett_modal.slett_feilet')}
                        </Alert>
                      )}

                      <Knapper>
                        <Button
                          icon={<TrashIcon aria-hidden />}
                          variant="danger"
                          onClick={(e) => slettKrav(data.id)}
                          disabled={modalSlettButtonDisabled}
                          loading={modalSlettButtonDisabled}
                        >
                          {t('oversikt.slett_modal.knapp_slett')}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setModalDeleteOpen(false)
                            logSlettKravAvbrutt()
                          }}
                        >
                          {t('oversikt.slett_modal.knapp_lukk')}
                        </Button>
                      </Knapper>
                    </main>
                  )}
                  {data.utbetalingsdato && (
                    <main>
                      <Heading spacing level="1" size="large">
                        {t('oversikt.slett_modal.allerede_utbetalt_overskrift')}
                      </Heading>
                      <BodyLong spacing>{t('oversikt.slett_modal.allerede_utbetalt_beskrivelse1')}</BodyLong>
                      <BodyLong spacing>
                        <Trans t={t} i18nKey="oversikt.slett_modal.allerede_utbetalt_beskrivelse2">
                          <></>
                          <Link
                            onClick={() => logSlettUtbetaltKravEpost()}
                            href={
                              'mailto:nav.hot.behandlingsbriller@nav.no?subject=Brillekrav ønskes slettet: ' +
                              data.id +
                              '&body=Detaljer om kravet: %0A' +
                              'NAVs referanse: ' +
                              data.id +
                              '%0A' +
                              'Foretak: ' +
                              data.orgnr +
                              ' ' +
                              data.orgnavn +
                              '%0A' +
                              '%0A' +
                              'Beskriv hvorfor kravet ønskes slettet under linjen: %0A' +
                              '-------------------------------------------------------------------------- %0A%0A'
                            }
                          >
                            <></>
                          </Link>
                          <></>
                        </Trans>
                      </BodyLong>
                      <Knapper>
                        <Button variant="secondary" onClick={() => setModalDeleteOpen(false)}>
                          {t('oversikt.slett_modal.knapp_lukk')}
                        </Button>
                      </Knapper>
                    </main>
                  )}
                </Modal.Content>
              </Modal>
            </>
          )}
        </main>
      </DontPrintHelper>
    </div>
  )
}

const Line = () => {
  return <hr style={{ borderTop: '1px solid #707070' }} />
}

interface DatumHelperProps {
  label: string
  children?: Nullable<ReactNode>
}

const DatumHelper = (props: DatumHelperProps) => {
  return (
    <Datum label={props.label}>{props.children && <span style={{ marginLeft: '1rem' }}>{props.children}</span>}</Datum>
  )
}

export const DontPrintHelper = styled.div<{ labelColumnWidth?: number }>`
  @media print {
    .dontPrintMe {
      display: none;
    }
  }
`
