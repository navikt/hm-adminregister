import { useIsoVersion } from 'utils/iso-version'

import { LocalAlert } from '@navikt/ds-react'

export const IsoMappingWarning = ({ iso16 }: { iso16: string | undefined }) => {
  const isoVersion = useIsoVersion()

  if (isoVersion !== 'v22') return null

  return (
    <LocalAlert status="warning">
      <LocalAlert.Header>
        <LocalAlert.Title>Mangler mapping for ISO-v22</LocalAlert.Title>
      </LocalAlert.Header>
      <LocalAlert.Content>
        ISO16-kategorien{iso16 ? ` ${iso16}` : ''} på serien er ikke mappet til ISO22.
      </LocalAlert.Content>
    </LocalAlert>
  )
}
