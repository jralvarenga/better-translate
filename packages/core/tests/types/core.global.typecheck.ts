import {
  createTranslationHelpers,
  getAvailableLanguages,
  getMessages,
  getSupportedLocales,
  loadLocale,
  t,
} from "@better-translate/core";

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
  languages: [
    {
      icon: "🇪🇸",
      locale: "es",
      nativeLabel: "Español",
      shortLabel: "ES",
    },
  ],
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
helpers.t("Welcome back", { bt: true });
helpers.t("account.balance.label");
helpers.t("common.hello", {
  config: {
    rtl: true,
  },
});
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
helpers.getAvailableLanguages()[0]?.locale;
helpers.getSupportedLocales().includes("en");
helpers.getDirection({ locale: "es" });
helpers.isRtl({
  config: {
    rtl: true,
  },
});
helpers.getMessages().en?.account?.balance?.label;

const {
  getDirection: getConfiguredDirection,
  getAvailableLanguages: getConfiguredLanguages,
  getMessages: getConfiguredMessages,
  getSupportedLocales: getConfiguredSupportedLocales,
  isRtl: getConfiguredIsRtl,
  loadLocale: loadConfiguredLocale,
  t: translate,
} = helpers;

translate("common.hello");
translate("Welcome back", { bt: true });
translate("account.balance.label");
translate("common.hello", {
  config: {
    rtl: false,
  },
});
loadConfiguredLocale("fr");
getConfiguredDirection();
getConfiguredLanguages()[0]?.locale;
getConfiguredIsRtl();
getConfiguredSupportedLocales().includes("en");
getConfiguredMessages().en?.account?.balance?.label;

getMessages();
getAvailableLanguages();
getSupportedLocales();
void loadLocale("fr");
void t("common.hello");
void t("Welcome back", { bt: true });

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
