import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { initInstrumentation } from 'faro/faro'
import { initMsw } from 'mocks/initMsw'
import { initSkyra } from 'utils/skyra'
import { baseUrl } from 'utils/swr-hooks'
import { initUmami } from 'utils/umami'

import '@navikt/ds-css'
import { App } from 'App'

import './styles/globals.scss'

import './i18n'

initMsw().then(() => {
  initUmami()
  initInstrumentation()
  initUmami()
  initSkyra()

  const container = document.getElementById('root')!
  createRoot(container).render(
    <>
      <BrowserRouter basename={baseUrl()}>
        <App />
      </BrowserRouter>
    </>
  )
})
