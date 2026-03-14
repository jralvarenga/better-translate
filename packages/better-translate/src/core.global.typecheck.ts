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
    greeting: "Good morning {name}",
    formalGreeting: "{salute} {name}",
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
        greeting: "Buenos dias {name}",
        formalGreeting: "{salute} {name}",
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
t("common.greeting", {
  params: {
    name: "Ada",
  },
});
t("common.formalGreeting", {
  params: {
    salute: "Dr.",
    name: "Ada",
  },
});
loadLocale("fr");
getSupportedLocales().includes("en");
getMessages().en?.account?.balance?.label;

// @ts-expect-error invalid translation key should fail for the global helper
t("account.balance.total");

// @ts-expect-error missing params should fail for the global helper
t("common.greeting");

t("common.greeting", {
  params: {
    // @ts-expect-error inferred params should reject unknown placeholder names
    user: "Ada",
  },
});

// @ts-expect-error unsupported locale should fail for the global helper
loadLocale("pt");
