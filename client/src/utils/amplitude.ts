import * as amplitude from "@amplitude/analytics-browser";
import { track } from "@amplitude/analytics-browser";

const APP_NAME = "hm-adminregister";
const TEAM_NAME = "teamdigihot";
const AMP_COLLECTION_URL = "https://amplitude.nav.no/collect";
const AMP_PUBLIC_KEY_PROD = "e712770cd66f32a51e663fd31ac5e379";
const AMP_PUBLIC_KEY_DEV = "bcfab83a980e1598dab1ef32a07e9653";

type LogEvent = (params: { name: string; data?: any }) => void;

let amplitudeLogger: LogEvent | undefined = undefined;

export enum digihot_customevents {
  VISNING_OVERSIKT = "visning av sider fra hm-adminregister-app",
  LEVERANDORPRODUKTER_KLIKKET_V2 = "klikket på vis leverandørprodukter",
  NAVIGERE = "navigere",
  KLIKK = "klikk på knapp",
  ERROR_URL = "feil ved url",
  VARIANTSIDE_VIST = "visning av stor variantside",
}

export const initAmplitude = () => {
  const apiKey = window.appSettings.MILJO
    ? window.appSettings.MILJO === "prod-gcp"
      ? AMP_PUBLIC_KEY_PROD
      : window.appSettings.MILJO === "dev-gcp"
        ? AMP_PUBLIC_KEY_DEV
        : "mock"
    : "mock";
  console.log("Amplitude API key = ", apiKey);
  if (apiKey === "mock") {
    amplitudeLogger = (params: { name: string; data?: any }) => {
      console.log("[Mock Amplitude Event]", {
        name: params.name,
        data: {
          ...("data" in params.data ? params.data.data : {}),
          ...params.data,
        },
      });
    };
  } else {
    amplitude.init(apiKey!, {
      serverUrl: AMP_COLLECTION_URL,
      serverZone: "EU",
      autocapture: {
        attribution: true,
        pageViews: true,
        sessions: true,
        formInteractions: true,
        fileDownloads: true,
        elementInteractions: true,
      },
    });
    amplitudeLogger = (params: { name: string; data?: any }) => {
      amplitude.logEvent(params.name, params.data);
    };
  }
};

export function logAmplitudeEvent(eventName: string, data?: any) {
  setTimeout(() => {
    data = {
      app: APP_NAME,
      team: TEAM_NAME,
      ...data,
    };
    try {
      if (amplitude) {
        track(eventName, data);
      }
    } catch (error) {
      console.error(error);
    }
  });
}

export function logCustomEvent(event: digihot_customevents, data?: any) {
  logAmplitudeEvent(event, {
    TEAM_NAME: TEAM_NAME,
    ...data,
  });
}

export function logOversiktForsideVist() {
  logCustomEvent(digihot_customevents.VISNING_OVERSIKT);
}

export function logNavigationEvent(komponent: string, destinasjon: string, lenketekst: string) {
  logCustomEvent(digihot_customevents.NAVIGERE, {
    komponent: komponent,
    destinasjon: destinasjon,
    lenketekst: lenketekst,
  });
}

export function logLeverandorprodukterKlikket() {
  logCustomEvent(digihot_customevents.LEVERANDORPRODUKTER_KLIKKET_V2);
}

export function logVariantSideVist() {
  logCustomEvent(digihot_customevents.VARIANTSIDE_VIST);
}

export function logKlikk(buttonName: string) {
  logCustomEvent(digihot_customevents.KLIKK, {
    buttonName: buttonName,
  });
}

export function logErrorOnUrl(url: string) {
  logCustomEvent(digihot_customevents.ERROR_URL, {
    url: url,
  });
}

/*export enum amplitude_taxonomy {
  SKJEMA_START = "skjema startet",
  SKJEMA_ÅPEN = "skjema åpnet",
  SKJEMASTEG_FULLFØRT = "skjemasteg fullført",
  SKJEMAVALIDERING_FEILET = "skjemavalidering feilet",
  SKJEMAINNSENDING_FEILET = "skjemainnsending feilet",
  SKJEMA_FULLFØRT = "skjema fullført",
  NAVIGERE = "navigere",
}

// Events som ikke er i NAVs taksonomi
export enum digihot_customevents {
  VILKÅRSVURDERING_RESULTAT = "vilkårsvurdering resultat",
  PRINT_KVITTERING = "trykk på knapp for å skrive ut kvittering",
  PRINT_KRAV = "trykk på knapp for å skrive ut krav",
  SLETT_KRAV = "trykk på knapp for å åpne modal for å slette krav",
  SLETT_KRAV_BEKREFT = "trykk på knapp for å slette krav",
  SLETT_KRAV_AVBRYT = "trykk på knapp for å avbryte sletting av krav",
  SLETT_UTBETALT_KRAV = "trykk på knapp for å melde fra om feil i allerede utbetalt krav",
  SLETT_UTBETALT_KRAV_EPOST = "trykk på knapp for å sende epost om allerede utbetalt krav",
}

export enum SkjemaSteg {
  KRAV = 10,
}

const SKJEMANAVN = "hm-adminregister";

let skjemaId = uuidv4();

export function initAmplitude() {
  if (amplitude) {
    amplitude.getInstance().init("default", "", {
      apiEndpoint: "amplitude.nav.no/collect-auto",
      saveEvents: false,
      includeUtm: true,
      includeReferrer: true,
      platform: window.location.toString(),
    });
  }
}

export function logAmplitudeEvent(eventName: string, data?: any) {
  setTimeout(() => {
    data = {
      app: SKJEMANAVN,
      team: "teamdigihot",
      ...data,
    };
    try {
      if (amplitude) {
        amplitude.getInstance().logEvent(eventName, data);
      }
    } catch (error) {
      console.error(error);
    }
  });
}

export function logCustomEvent(event: digihot_customevents, data?: any) {
  logAmplitudeEvent(event, {
    skjemanavn: SKJEMANAVN,
    ...data,
  });
}

export function logNavigeringLenke(destinasjon: string): void {
  logAmplitudeEvent(amplitude_taxonomy.NAVIGERE, {
    skjemanavn: SKJEMANAVN,
    destinasjon: destinasjon,
  });
}

export function logSkjemaStartet() {
  skjemaId = uuidv4();
  logAmplitudeEvent(amplitude_taxonomy.SKJEMA_START, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
    steg: 0,
  });
}

export function logSkjemastegFullfoert(steg: SkjemaSteg) {
  logAmplitudeEvent(amplitude_taxonomy.SKJEMASTEG_FULLFØRT, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
    steg: steg,
  });
}

export function logSkjemaFullfoert() {
  logAmplitudeEvent(amplitude_taxonomy.SKJEMA_FULLFØRT, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
  });
}

export function logSkjemavalideringFeilet(feilmeldinger: string[] | undefined) {
  logAmplitudeEvent(amplitude_taxonomy.SKJEMAVALIDERING_FEILET, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
    feilmeldinger: feilmeldinger,
  });
}

export function logPrintKvitteringÅpnet() {
  logAmplitudeEvent(digihot_customevents.PRINT_KVITTERING, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
  });
}

export function logPrintKravÅpnet() {
  logAmplitudeEvent(digihot_customevents.PRINT_KRAV, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
  });
}

export function logSlettKravÅpnet() {
  logAmplitudeEvent(digihot_customevents.SLETT_KRAV, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
  });
}

export function logSlettKravBekreftet() {
  logAmplitudeEvent(digihot_customevents.SLETT_KRAV_BEKREFT, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
  });
}

export function logSlettKravAvbrutt() {
  logAmplitudeEvent(digihot_customevents.SLETT_KRAV_AVBRYT, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
  });
}

export function logSlettUtbetaltKravÅpnet() {
  logAmplitudeEvent(digihot_customevents.SLETT_UTBETALT_KRAV, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
  });
}

export function logSlettUtbetaltKravEpost() {
  logAmplitudeEvent(digihot_customevents.SLETT_UTBETALT_KRAV_EPOST, {
    skjemanavn: SKJEMANAVN,
    skjemaId: skjemaId,
  });
}
*/