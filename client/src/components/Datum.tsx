import { Label } from '@navikt/ds-react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Nullable } from '../types'

export interface DatumProps {
  label: string
  children?: Nullable<ReactNode>
}

export function Datum(props: DatumProps) {
  const { label, children } = props
  const { t } = useTranslation()
  return (
    <>
      <Label as="dt">{t(label)}</Label>
      <dd>{children}</dd>
    </>
  )
}
