import { Alert, BodyLong } from '@navikt/ds-react'
import { useTranslation } from 'react-i18next'
import { Avstand } from './components/Avstand'

export function IkkeAutorisert() {
  const { t } = useTranslation()
  return (
    <main>
      <Avstand paddingLeft={3} paddingRight={3}>
        <Alert variant="warning">
          <BodyLong>{t('feilside.ingen_tilgang')}</BodyLong>
        </Alert>
      </Avstand>
    </main>
  )
}
