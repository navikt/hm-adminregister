import styled from 'styled-components'

import { size } from './rules'

const Content = styled.div`
  width: 626px;
  margin: 0 auto;
  align-items: center;

  @media (max-width: ${size.large}) {
    width: 95%;
  }
`

export default Content
