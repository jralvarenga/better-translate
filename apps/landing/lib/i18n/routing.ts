import { defineRouting } from "@better-translate/nextjs";

import { landingDefaultLocale, landingLocales } from "./config";

export const routing = defineRouting({
  defaultLocale: landingDefaultLocale,
  locales: landingLocales,
  routeTemplate: "/[lang]",
});
