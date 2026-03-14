import { configureTranslations } from "better-translate/core";

import { BetterTranslateProvider } from "./provider.js";
import { useTranslations } from "./use-translations.js";

const translator = await configureTranslations({
  availableLocales: ["en", "es", "fr"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: {
    en: {
      common: {
        hello: "Hello",
      },
      account: {
        balance: {
          label: "Balance",
        },
      },
    },
    es: {
      common: {
        hello: "Hola",
      },
      account: {
        balance: {
          label: "Saldo",
        },
      },
    },
  },
  loaders: {
    fr: async () => ({
      common: {
        hello: "Bonjour",
      },
    }),
  },
} as const);

function Consumer() {
  const translations = useTranslations<typeof translator>();

  translations.t("common.hello");
  translations.t("account.balance.label");
  void translations.setLocale("es");
  void translations.loadLocale("fr");
  translations.messages.en;
  translations.messages.fr;

  // @ts-expect-error invalid translation key should fail
  translations.t("account.balance.total");

  // @ts-expect-error unsupported locale should fail
  void translations.setLocale("pt");

  return null;
}

<BetterTranslateProvider translator={translator}>
  <Consumer />
</BetterTranslateProvider>;

<BetterTranslateProvider translator={translator} initialLocale="es">
  <Consumer />
</BetterTranslateProvider>;

// @ts-expect-error initialLocale must be a supported locale
<BetterTranslateProvider translator={translator} initialLocale="pt">
  <Consumer />
</BetterTranslateProvider>;
