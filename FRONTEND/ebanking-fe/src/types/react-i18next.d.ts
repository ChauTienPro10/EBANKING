declare module 'react-i18next' {
  import type { i18n as I18nType } from 'i18next';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const initReactI18next: any;
  export function useTranslation(): { t: (key: string, opts?: Record<string, unknown>) => string; i18n: I18nType };
}





