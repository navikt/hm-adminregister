import { Label } from '@navikt/ds-react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Nullable } from '../types'

export interface DatumWithoutMarginProps {
  label: string
  fnr: string
  children?: Nullable<ReactNode>
}

export function DatumWithoutMargin(props: DatumWithoutMarginProps) {
  const { label, fnr } = props
  const { t } = useTranslation()
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <Label as="div">
        {t(label)}
        {fnr}
      </Label>
    </div>
  )
}
