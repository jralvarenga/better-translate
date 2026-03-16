import { getRequestConfig } from "@better-translate/nextjs/server";

import { createLandingTranslator } from "./config";

export const requestConfig = getRequestConfig(async () => {
  const translator = await createLandingTranslator();

  return {
    translator,
  };
});
