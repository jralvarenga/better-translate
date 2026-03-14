import { configureTranslations, getMessages } from "./core.js";

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

translator.t("common.hello");
translator.t("account.balance.label", { locale: "es" });
translator.loadLocale("fr");
translator.getMessages();
getMessages();

// @ts-expect-error invalid translation key should fail
translator.t("account.balance.total");

// @ts-expect-error unsupported locale should fail
translator.loadLocale("pt");

configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  messages: {
    en: {
      common: {
        hello: "Hello",
      },
    },
  },
});

// @ts-expect-error defaultLocale must be one of the available locales
configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "fr",
  messages: {
    en: {
      common: {
        hello: "Hello",
      },
    },
  },
});
