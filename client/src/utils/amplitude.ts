import * as amplitude from "@amplitude/analytics-browser";
import { track } from "@amplitude/analytics-browser";

const APP_NAME = "hm-adminregister";
const TEAM_NAME = "teamdigihot";
const AMP_COLLECTION_URL = "https://amplitude.nav.no/collect";
const AMP_PUBLIC_KEY_PROD = "e712770cd66f32a51e663fd31ac5e379";
const AMP_PUBLIC_KEY_DEV = "bcfab83a980e1598dab1ef32a07e9653";

type LogEvent = (params: { name: string; data?: any }) => void;

let amplitudeLogger: LogEvent | undefined = undefined;

enum digihot_customevents {
  VISNING_OVERSIKT = "visning av sider fra hm-adminregister-app",
  LEVERANDORPRODUKTER_KLIKKET_V2 = "klikket på vis leverandørprodukter",
  NAVIGERE = "navigere",
  KLIKK = "klikk på knapp",
  ERROR_URL = "feil ved url",
  VARIANTSIDE_VIST = "visning av stor variantside",
}

const initAmplitude = () => {
  const apiKey = window.appSettings.MILJO
    ? window.appSettings.MILJO === "prod-gcp"
      ? AMP_PUBLIC_KEY_PROD
      : window.appSettings.MILJO === "dev-gcp"
        ? AMP_PUBLIC_KEY_DEV
        : "mock"
    : "mock";
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

function logCustomEvent(event: digihot_customevents, data?: any) {
  logAmplitudeEvent(event, {
    TEAM_NAME: TEAM_NAME,
    ...data,
  });
}

function logOversiktForsideVist() {
  logCustomEvent(digihot_customevents.VISNING_OVERSIKT);
}

export function logNavigationEvent(komponent: string, destinasjon: string, lenketekst: string) {
  logCustomEvent(digihot_customevents.NAVIGERE, {
    komponent: komponent,
    destinasjon: destinasjon,
    lenketekst: lenketekst,
  });
}

function logLeverandorprodukterKlikket() {
  logCustomEvent(digihot_customevents.LEVERANDORPRODUKTER_KLIKKET_V2);
}

function logVariantSideVist() {
  logCustomEvent(digihot_customevents.VARIANTSIDE_VIST);
}

function logKlikk(buttonName: string) {
  logCustomEvent(digihot_customevents.KLIKK, {
    buttonName: buttonName,
  });
}

function logErrorOnUrl(url: string) {
  logCustomEvent(digihot_customevents.ERROR_URL, {
    url: url,
  });
}
