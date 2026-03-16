import { getRequestConfig } from "@better-translate/nextjs/server";
import { configureTranslations } from "better-translate/core";

import { en, es } from "./messages";
import { routing } from "./routing";

export const requestConfig = getRequestConfig(async () => {
  const translator = await configureTranslations({
    availableLocales: routing.locales,
    defaultLocale: "en",
    fallbackLocale: "en",
    messages: {
      en,
      es,
    },
  });

  return {
    translator,
  };
});
