import {
  configureTranslations,
  getMessages,
  getSupportedLocales,
  loadLocale,
  t,
} from "./core.js";

const en = {
  common: {
    hello: "Hello",
  },
  account: {
    balance: {
      label: "Balance",
    },
  },
} as const;

declare module "./core.js" {
  interface BetterTranslateAppConfig {
    Locale: "en" | "es" | "fr";
    Messages: typeof en;
  }
}

await configureTranslations({
  availableLocales: ["en", "es", "fr"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: {
    en,
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
});

t("common.hello");
t("account.balance.label");
loadLocale("fr");
getSupportedLocales().includes("en");
getMessages().en?.account?.balance?.label;

// @ts-expect-error invalid translation key should fail for the global helper
t("account.balance.total");

// @ts-expect-error unsupported locale should fail for the global helper
loadLocale("pt");
