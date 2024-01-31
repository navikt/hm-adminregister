import styled from 'styled-components'

import { size } from './rules'

const Content = styled.div`
  width: 43rem;
  margin: 0 auto;

  @media (max-width: ${size.large}) {
    width: 95%;
  }
`

export default Content
