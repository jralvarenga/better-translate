import {
  createTranslationHelpers,
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

const helpers = await createTranslationHelpers({
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

helpers.t("common.hello");
helpers.t("account.balance.label");
helpers.t("common.greeting", {
  params: {
    name: "Ada",
  },
});
helpers.t("common.formalGreeting", {
  params: {
    salute: "Dr.",
    name: "Ada",
  },
});
helpers.loadLocale("fr");
helpers.getSupportedLocales().includes("en");
helpers.getMessages().en?.account?.balance?.label;

const {
  getMessages: getConfiguredMessages,
  getSupportedLocales: getConfiguredSupportedLocales,
  loadLocale: loadConfiguredLocale,
  t: translate,
} = helpers;

translate("common.hello");
translate("account.balance.label");
loadConfiguredLocale("fr");
getConfiguredSupportedLocales().includes("en");
getConfiguredMessages().en?.account?.balance?.label;

getMessages();
getSupportedLocales();
void loadLocale("fr");
void t("common.hello");

// @ts-expect-error invalid translation key should fail for the configured helpers
translate("account.balance.total");

// @ts-expect-error missing params should fail for the configured helpers
translate("common.greeting");

translate("common.greeting", {
  params: {
    // @ts-expect-error inferred params should reject unknown placeholder names
    user: "Ada",
  },
});

// @ts-expect-error unsupported locale should fail for the configured helpers
loadConfiguredLocale("pt");
