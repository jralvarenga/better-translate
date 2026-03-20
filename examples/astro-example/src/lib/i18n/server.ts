import {
  createServerHelpers,
  setRequestLocale,
} from "@better-translate/astro";

import { requestConfig } from "./request";

export const {
  getAvailableLanguages,
  getDirection,
  getLocale,
  getMessages,
  getTranslations,
  getTranslator,
  isRtl,
} = createServerHelpers(requestConfig);

export { setRequestLocale };
