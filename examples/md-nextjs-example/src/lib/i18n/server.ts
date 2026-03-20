import { cookies } from "next/headers";
import path from "path";
import { createMarkdownHelpers } from "@better-translate/md";
import { localeCookieName, resolveLocaleFromCookie } from "./locale";
import { getConfiguredTranslator } from "./config";

export async function getCurrentLocale() {
  const store = await cookies();
  return resolveLocaleFromCookie(store.get(localeCookieName)?.value);
}

export async function getTranslations() {
  const [translator, locale] = await Promise.all([
    getConfiguredTranslator(),
    getCurrentLocale(),
  ]);
  // Return a locale-bound translate function using per-call locale override.
  // Cast to loose type so callers can pass arbitrary string keys.
  const looseTrans = translator as { t(key: string, options?: unknown): string };
  return (key: string, params?: Record<string, string>) =>
    looseTrans.t(key, { locale, params });
}

export async function getMarkdownHelpers() {
  const translator = await getConfiguredTranslator();
  return createMarkdownHelpers(translator, {
    rootDir: path.join(process.cwd(), "content"),
  });
}
