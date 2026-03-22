export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const localeCookieName = "bt-locale";

export function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale);
}

export function resolveLocaleFromCookie(
  cookieValue: string | undefined,
): Locale {
  if (cookieValue && isLocale(cookieValue)) return cookieValue;
  return defaultLocale;
}
