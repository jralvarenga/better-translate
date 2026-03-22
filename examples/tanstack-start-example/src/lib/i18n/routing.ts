import { defineRouting } from "@better-translate/tanstack-router";

export const routing = defineRouting({
  locales: ["en", "es"] as const,
  defaultLocale: "en",
  routeTemplate: "/{$lang}",
});

export type AppLocale = (typeof routing.locales)[number];
