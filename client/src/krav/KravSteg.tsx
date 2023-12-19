import { Heading } from '@navikt/ds-react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Banner } from '../components/Banner'

export interface KravStegProps {
  children: ReactNode
}

export function KravSteg(props: KravStegProps) {
  const { children } = props
  const { t } = useTranslation()
  return (
    <>
      <header>
        <Banner>
          <Heading level="1" size="large">
            {t('krav.overskrift')}
          </Heading>
        </Banner>
      </header>
      <main>{children}</main>
    </>
  )
}
