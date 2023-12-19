import styled from 'styled-components'
import { enhet } from '../enhet'

export const DataResponsive = styled.dl<{ labelColumnWidth?: number }>`
  display: grid;
  grid-template-columns: ${(props) => (props.labelColumnWidth ? `${props.labelColumnWidth}px` : '140px')} auto;
  gap: var(--a-spacing-1);
  margin-top: 5px;

  @media ${enhet.mobil} {
    width: 95%;
    grid-template-columns: 1fr;
  }
`
