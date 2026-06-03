import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import es from "./locales/es.json";
import en from "./locales/en.json";
import pt from "./locales/pt.json";

export const SUPPORTED_LANGS = ["es", "en", "pt"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export const LANG_LABELS: Record<Lang, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      pt: { translation: pt },
    },
    fallbackLng: "es",
    supportedLngs: SUPPORTED_LANGS,
    nonExplicitSupportedLngs: true, // "es-MX" → "es"
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "mundialgo-lang",
      caches: ["localStorage"],
    },
  });

export default i18n;
