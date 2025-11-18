import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import vi from "./locales/vi.json";

export const DEFAULT_NS = "common" as const;

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { [DEFAULT_NS]: en },
      vi: { [DEFAULT_NS]: vi },
    },
    lng: localStorage.getItem("lang") || "vi",
    fallbackLng: "en",
    ns: [DEFAULT_NS],
    defaultNS: DEFAULT_NS,
    interpolation: { escapeValue: false },
  });

export default i18n;











