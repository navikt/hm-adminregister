import { Panel } from '@navikt/ds-react'
import styled from 'styled-components'
import { enhet } from '../enhet'

export const DataPanelBarn = styled(Panel)`
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 3em;
  margin-bottom: var(--a-spacing-5);
  background-color: #e6f0ff;
  border-radius: 5px;
  align-items: center;
  padding-top: 1.5rem;
  padding-bottom: 0;

  @media ${enhet.mobil} {
    width: 95%;
    grid-template-columns: 1fr;
    row-gap: 10px;
    justify-items: center;
  }
`
