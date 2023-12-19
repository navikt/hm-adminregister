import { Button } from '@navikt/ds-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useApplicationContext } from '../state/ApplicationContext'

export function AvbrytKrav() {
  const { t } = useTranslation()
  const { resetAppState } = useApplicationContext()
  const navigate = useNavigate()
  return (
    <Button
      variant="secondary"
      type="button"
      onClick={() => {
        resetAppState()
        navigate('/')
      }}
    >
      {t('krav.knapp_avbryt')}
    </Button>
  )
}
