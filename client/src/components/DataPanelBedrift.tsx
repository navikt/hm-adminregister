import { Panel } from '@navikt/ds-react'
import styled from 'styled-components'
import { enhet } from '../enhet'

export const DataPanelBedrift = styled(Panel)`
  display: grid;
  grid-template-columns: 1fr auto;
  column-gap: 3em;
  border-radius: 10px;
  border-color: black;
  align-items: center;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  margin: var(--a-spacing-5);

  @media ${enhet.mobil} {
    grid-template-columns: 1fr;
    row-gap: 10px;
    justify-items: center;
  }
`
