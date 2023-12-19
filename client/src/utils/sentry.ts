import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

const MILJO = window.appSettings?.MILJO
const USE_MSW = window.appSettings?.USE_MSW

export function initSentry() {
  Sentry.init({
    dsn: 'https://2c6044e4012c41f8b7b6000569dbf08d@sentry.gc.nav.no/165',
    integrations: [new BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    // tracesSampleRate: 1.0,
    denyUrls: [
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      // Safari extensions
      /^safari-extension:/i,
      // external scripts
      /psplugin/,
      /dekoratoren\/client/,
    ],
    enabled: (MILJO === 'dev-gcp' && USE_MSW === false) || MILJO === 'prod-gcp',
    environment: MILJO,
  })
}
