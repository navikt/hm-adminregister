import { baseUrl } from '../http'

export async function initMSW(): Promise<ServiceWorkerRegistration | void> {
  if (!window.appSettings.USE_MSW) {
    return
  }
  const { worker } = await import('../mocks/browser')
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: baseUrl('/mockServiceWorker.js'),
    },
  })
}
