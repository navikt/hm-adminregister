import styled from 'styled-components'
import { enhet } from '../enhet'

export const Data = styled.dl<{ labelColumnWidth?: number }>`
  display: grid;
  grid-template-columns: ${(props) => (props.labelColumnWidth ? `${props.labelColumnWidth}px` : '190px')} auto;
  gap: var(--a-spacing-1);

  @media ${enhet.small} {
    display: block;
  }
`
