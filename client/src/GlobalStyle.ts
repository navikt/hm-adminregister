import { createGlobalStyle } from 'styled-components'
import { enhet } from './enhet'

export const GlobalStyle = createGlobalStyle`
  main {
    width: 680px;
    margin: 0 auto;
    padding: 40px;
    @media ${enhet.mobil} {
      width: 100%;
      padding: 40px 10px;
    }
  }
`
