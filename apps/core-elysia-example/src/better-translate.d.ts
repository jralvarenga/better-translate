import "better-translate/core";

import type en from "./locales/en";

declare module "better-translate/core" {
  interface BetterTranslateAppConfig {
    Locale: "en" | "es";
    Messages: typeof en;
  }
}
