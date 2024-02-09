import '@navikt/ds-css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from 'App'
import './styles/globals.scss'
import { baseUrl } from 'utils/swr-hooks'

const container = document.getElementById('root')!
createRoot(container).render(
  <>
    <React.StrictMode>
      <BrowserRouter basename={baseUrl()}>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  </>,
)
