import { useIsoVersion } from 'utils/iso-version'

import { LocalAlert } from '@navikt/ds-react'

export const IsoMappingWarning = () => {
  const isoVersion = useIsoVersion()

  if (isoVersion !== 'v22') return null

  return (
    <LocalAlert status="warning">
      <LocalAlert.Header>
        <LocalAlert.Title>Mangler mapping for ISO-v22</LocalAlert.Title>
      </LocalAlert.Header>
      <LocalAlert.Content>
        ISO16-kategori på serie er ikke mappet til ISO22.
      </LocalAlert.Content>
    </LocalAlert>
  )
}
