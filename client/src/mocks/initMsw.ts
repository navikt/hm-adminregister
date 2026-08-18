import { baseUrl } from 'utils/swr-hooks'

const isMswSkipped = () =>
  new URLSearchParams(window.location.search).get('msw') === 'off' || localStorage.getItem('SKIP_MSW') === 'true'

export async function initMsw(): Promise<unknown> {
  if (!window.appSettings.USE_MSW || isMswSkipped()) {
    return
  }

  const { worker } = await import('../mocks/browser')
  worker.listHandlers().forEach((handler) => {
    if (handler.kind === 'request') {
      console.log(handler.info.header)
    } else if (handler.kind === 'websocket') {
      console.log(handler.id)
    }
  })
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: baseUrl('/mockServiceWorker.js'),
    },
  })
}
