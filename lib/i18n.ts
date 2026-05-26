export const SUPPORTED_LOCALES = ["en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isSupportedLocale(code: string): code is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(code);
}
