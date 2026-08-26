import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import mr from "../locales/mr.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      mr: { translation: mr },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    parseMissingKeyHandler: (key: string) => {
      const parts = key.split(".");
      const lastPart = parts[parts.length - 1];
      return lastPart.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
    },
  });

export default i18n;
