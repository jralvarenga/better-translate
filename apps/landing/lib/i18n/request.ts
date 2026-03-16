import { getRequestConfig } from "@better-translate/nextjs/server";

import { createLandingTranslator } from "./config";
import { routing } from "./routing";

export const requestConfig = getRequestConfig(async () => {
  const translator = await createLandingTranslator();

  return {
    locale: routing.defaultLocale,
    translator,
  };
});
