import { Heading, Label } from '@navikt/ds-react'
import { DataPanelBarn } from '../components/DataPanelBarn'
import { BrillebarnComponent } from '../resources/svg/BrillebarnComponent'
import { t } from 'i18next'
import { DataResponsive } from '../components/DataResponsive'
import { DatumWithoutMargin } from '../components/DatumWithoutMargin'

export interface BarnProps {
  fnr: string
  navn: string
  alder?: number
}

export function Barn(props: BarnProps) {
  const { fnr, navn, alder } = props
  let alderTekst = typeof alder === 'number' ? ` (${alder} år)` : ''
  return (
    <DataPanelBarn>
      <BrillebarnComponent />
      <div role="alert">
        <Heading level="3" size="xsmall">
          {`${navn}${alderTekst}`}
        </Heading>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr' }}>
          <Label as="div">{`${t('krav.ledetekst_fnr')}`}</Label>
          <div style={{ paddingLeft: '0.5rem' }}>{fnr}</div>
        </div>
      </div>
    </DataPanelBarn>
  )
}
