// Supported UI locales. Add a new entry here when adding a language:
// 1. Create locales/<code>.json with all keys from locales/en.json
// 2. Add the code to SUPPORTED_LOCALES below
// 3. Import and add to the translations map in the component
// 4. Re-enable the locale switcher UI in components/Contrivox.jsx

export const SUPPORTED_LOCALES = ["en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isSupportedLocale(code: string): code is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(code);
}
