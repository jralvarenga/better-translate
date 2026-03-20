import { createBetterTranslateMiddleware } from "@better-translate/astro/middleware";

import { requestConfig } from "./lib/i18n/request";

export const onRequest = createBetterTranslateMiddleware(requestConfig);
