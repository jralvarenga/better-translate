import "better-translate/core";

import type en from "./locales/en.json";

declare module "better-translate/core" {
  interface BetterTranslateAppConfig {
    Locale: "en" | "es";
    Messages: typeof en;
  }
}
