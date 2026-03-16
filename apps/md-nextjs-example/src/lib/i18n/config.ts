import { configureTranslations } from "better-translate/core";
import { en } from "./messages/en";
import { es } from "./messages/es";

const createTranslator = () =>
  configureTranslations({
    availableLocales: ["en", "es"] as const,
    defaultLocale: "en",
    fallbackLocale: "en",
    messages: { en, es },
  });

// Module-level singleton — Next.js module cache keeps this alive between requests
let _promise: ReturnType<typeof createTranslator> | null = null;

export function getConfiguredTranslator() {
  if (!_promise) {
    _promise = createTranslator();
  }
  return _promise;
}
