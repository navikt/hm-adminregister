import amplitude from 'amplitude-js'
import { v4 as uuidv4 } from 'uuid'

export enum amplitude_taxonomy {
  SKJEMA_START = 'skjema startet',
  SKJEMA_ÅPEN = 'skjema åpnet',
  SKJEMASTEG_FULLFØRT = 'skjemasteg fullført',
  SKJEMAVALIDERING_FEILET = 'skjemavalidering feilet',
  SKJEMAINNSENDING_FEILET = 'skjemainnsending feilet',
  SKJEMA_FULLFØRT = 'skjema fullført',
  NAVIGERE = 'navigere',
}

// Events som ikke er i NAVs taksonomi
export enum digihot_customevents {
  VILKÅRSVURDERING_RESULTAT = 'vilkårsvurdering resultat',
  PRINT_KVITTERING = 'trykk på knapp for å skrive ut kvittering',
  PRINT_KRAV = 'trykk på knapp for å skrive ut krav',
  SLETT_KRAV = 'trykk på knapp for å åpne modal for å slette krav',
  SLETT_KRAV_BEKREFT = 'trykk på knapp for å slette krav',
  SLETT_KRAV_AVBRYT = 'trykk på knapp for å avbryte sletting av krav',
  SLETT_UTBETALT_KRAV = 'trykk på knapp for å melde fra om feil i allerede utbetalt krav',
  SLETT_UTBETALT_KRAV_EPOST = 'trykk på knapp for å sende epost om allerede utbetalt krav',
}

export enum SkjemaSteg {
  KRAV = 10,
}

const SKJEMANAVN = 'hm-brille-frontend'

let skjemaId = uuidv4()

export function initAmplitude() {
  if (amplitude) {
    amplitude.getInstance().init('default', '', {
      apiEndpoint: 'amplitude.nav.no/collect-auto',
      saveEvents: false,
      includeUtm: true,
      includeReferrer: true,
      platform: window.location.toString(),
    })
  }
}

export function logAmplitudeEvent(eventName: string, data?: any) {
  setTimeout(() => {
    data = {
      app: SKJEMANAVN,
      team: 'teamdigihot',
      ...data,
    }
    try {
      if (amplitude) {
        amplitude.getInstance().logEvent(eventName, data)
      }
    } catch (error) {
      console.error(error)
    }
  })
}

export function logCustomEvent(event: digihot_customevents, data?: any) {
  logAmplitudeEvent(event, {
    skjemanavn: SKJEMANAVN,
    ...data,
  })
}

export function logNavigeringLenke(destinasjon: string): void {
  logAmplitudeEvent(amplitude_taxonomy.NAVIGERE, {
    skjemanavn: SKJEMANAVN,
    destinasjon: destinasjon,
  })
}

export function logSkjemaStartet() {
  skjemaId = uuidv4()
  logAmplitudeEvent(amplitude_taxonomy.SKJEMA_START, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
    steg: 0,
  })
}

export function logSkjemastegFullfoert(steg: SkjemaSteg) {
  logAmplitudeEvent(amplitude_taxonomy.SKJEMASTEG_FULLFØRT, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
    steg: steg,
  })
}

export function logSkjemaFullfoert() {
  logAmplitudeEvent(amplitude_taxonomy.SKJEMA_FULLFØRT, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
  })
}

export function logSkjemavalideringFeilet(feilmeldinger: string[] | undefined) {
  logAmplitudeEvent(amplitude_taxonomy.SKJEMAVALIDERING_FEILET, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
    feilmeldinger: feilmeldinger,
  })
}

export function logPrintKvitteringÅpnet() {
  logAmplitudeEvent(digihot_customevents.PRINT_KVITTERING, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
  })
}

export function logPrintKravÅpnet() {
  logAmplitudeEvent(digihot_customevents.PRINT_KRAV, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
  })
}

export function logSlettKravÅpnet() {
  logAmplitudeEvent(digihot_customevents.SLETT_KRAV, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
  })
}

export function logSlettKravBekreftet() {
  logAmplitudeEvent(digihot_customevents.SLETT_KRAV_BEKREFT, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
  })
}

export function logSlettKravAvbrutt() {
  logAmplitudeEvent(digihot_customevents.SLETT_KRAV_AVBRYT, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
  })
}

export function logSlettUtbetaltKravÅpnet() {
  logAmplitudeEvent(digihot_customevents.SLETT_UTBETALT_KRAV, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
  })
}

export function logSlettUtbetaltKravEpost() {
  logAmplitudeEvent(digihot_customevents.SLETT_UTBETALT_KRAV_EPOST, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
  })
}
