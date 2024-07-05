import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import nb from "./resources/nb_translation.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      nb: {
        translation: nb,
      },
    },
    lng: "nb",
    fallbackLng: false,
    supportedLngs: ["nb"],
    fallbackNS: "App",
    keySeparator: false,
    nsSeparator: false,
    interpolation: {
      escapeValue: false,
    },
    debug: true,
  })
  .catch((err) => {
    console.error(err);
  });

export default i18n;
