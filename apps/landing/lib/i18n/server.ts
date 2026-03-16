import { createServerHelpers } from "@better-translate/nextjs/server";

import { requestConfig } from "./request";

export const { getLocale, getMessages, getTranslations, getTranslator } =
  createServerHelpers(requestConfig);
