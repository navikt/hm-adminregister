import { Button } from '@navikt/ds-react'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Knapper } from '../components/Knapper'
import { useApplicationContext } from '../state/ApplicationContext'
import { OpprettKravRequest, OpprettKravResponse, Vilkårsgrunnlag } from '../types'
import { usePost } from '../usePost'
import { logSkjemaFullfoert } from '../utils/amplitude'
import { AvbrytKrav } from './AvbrytKrav'

export interface SendInnKravProps {
  vilkårsgrunnlag: Vilkårsgrunnlag
}

export function SendInnKrav(props: SendInnKravProps) {
  const { t } = useTranslation()
  const { appState } = useApplicationContext()
  const navigate = useNavigate()

  const {
    post: sendInnKrav,
    data: sendInnKravData,
    loading: sendInnKravLoading,
  } = usePost<OpprettKravRequest, OpprettKravResponse>('/krav')

  useEffect(() => {
    if (sendInnKravData) {
      navigate(`/krav/kvittering`, {
        state: sendInnKravData,
      })
    }
  }, [sendInnKravData])

  return (
    <Knapper>
      <Button
        loading={sendInnKravLoading}
        onClick={async () => {
          await sendInnKrav({
            vilkårsgrunnlag: props.vilkårsgrunnlag,
            bestillingsreferanse: appState.bestillingsreferanse,
            brukersNavn: appState.barnNavn,
            orgNavn: appState.orgNavn,
            orgAdresse: appState.orgAdresse,
          })
          logSkjemaFullfoert()
        }}
      >
        {t('krav.knapp_send_inn_kravet')}
      </Button>
      <AvbrytKrav />
    </Knapper>
  )
}
