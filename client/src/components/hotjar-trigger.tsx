import { useEffect } from 'react'

declare global {
  interface Window {
    hj: any
  }
}

export enum hotjar_event {
  KVITTERING = 'digihot_hm_brille_api_krav',
  SKJEMA = 'digihot_hm_brillekrav_skjema',
}

interface HotjarTriggerProps {
  timeout: number
}

export const HotjarTrigger = ({ timeout }: HotjarTriggerProps, event: hotjar_event) => {
  useEffect(() => {
    setTimeout(() => {
      window.hj =
        window.hj ||
        function () {
          ;(window.hj.q = window.hj.q || []).push(arguments)
        }
      if (window.appSettings.MILJO !== 'labs-gcp' && window.appSettings.MILJO !== 'dev-gcp') {
        window.hj('trigger', event)
      }
    }, timeout)
  }, [])
}
