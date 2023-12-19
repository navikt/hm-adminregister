import { Alert } from '@navikt/ds-react'
import { useTranslation } from 'react-i18next'

export function IkkeFunnet() {
  const { t } = useTranslation()
  return <Alert variant="warning">{t('krav.barnet_ikke_funnet')}</Alert>
}
