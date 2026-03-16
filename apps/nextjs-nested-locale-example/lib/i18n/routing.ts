import { defineRouting } from "@better-translate/nextjs";

export const routing = defineRouting({
  locales: ["en", "es"] as const,
  defaultLocale: "en",
  routeTemplate: "/app/[lang]",
});
