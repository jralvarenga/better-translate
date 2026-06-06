import type {
  DeepStringify,
  DotKeys,
  SupportedLocaleRouteSyntax,
  TranslationDirection,
  TranslationLanguageMetadata,
  TranslationLocaleMap,
} from "@better-translate/core";
import {
  SUPPORTED_LOCALE_ROUTE_SYNTAXES,
  configureTranslations,
  getAvailableLanguages,
  getMessages,
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

const es = {
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
} as const;

type Locale = "en" | "es";
type AppMessages = typeof en;
type TranslationKey = DotKeys<AppMessages>;

const supportedLocaleRouteParamName: SupportedLocaleRouteSyntax = "lang";
const supportedLocaleRouteSyntaxes = SUPPORTED_LOCALE_ROUTE_SYNTAXES;
const firstSupportedLocaleRouteSyntax: "locale" =
  supportedLocaleRouteSyntaxes[0];

const translationKey: TranslationKey = "account.balance.label";
const spanishMessages: DeepStringify<AppMessages> = es;

const messages = {
  en,
  es: spanishMessages,
} satisfies TranslationLocaleMap<Locale, AppMessages>;

const translator = await configureTranslations({
  availableLocales: ["en", "es", "fr"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  directions: {
    es: "rtl",
  },
  languages: [
    {
      icon: "🇪🇸",
      locale: "es",
      nativeLabel: "Español",
      shortLabel: "ES",
    },
  ],
  messages,
  loaders: {
    fr: async () => ({
      common: {
        hello: "Bonjour",
      },
    }),
  },
} as const);

translator.t("common.hello");
translator.t("Welcome back", { bt: true });
translator.t("Welcome {name}", {
  bt: true,
  params: {
    name: "Ada",
  },
});
translator.t("Welcome back", {
  bt: true,
  locale: "es",
  config: {
    rtl: true,
  },
});
translator.t(translationKey, { locale: "es" });
translator.t("common.hello", {
  config: {
    rtl: true,
  },
});
translator.t("common.greeting", {
  params: {
    name: "Ada",
  },
});
translator.t("common.formalGreeting", {
  params: {
    salute: "Dr.",
    name: "Ada",
  },
});
translator.loadLocale("fr");
translator.getAvailableLanguages();
translator.getDirection();
translator.getDirection({ locale: "es" });
translator.getDirection({
  locale: "es",
  config: {
    rtl: false,
  },
});
translator.isRtl();
translator.isRtl({
  config: {
    rtl: true,
  },
});
translator.getMessages();
getAvailableLanguages();
getMessages();

const configuredLanguages = translator.getAvailableLanguages();
const configuredLanguage = configuredLanguages[0];

if (configuredLanguage) {
  const configuredLanguageLocale: Locale | "fr" = configuredLanguage.locale;
  const configuredLanguageMetadata: TranslationLanguageMetadata<Locale | "fr"> =
    configuredLanguage;

  void configuredLanguageLocale;
  void configuredLanguageMetadata;
}
void supportedLocaleRouteParamName;
void firstSupportedLocaleRouteSyntax;

// @ts-expect-error invalid translation key should fail
translator.t("account.balance.total");

// @ts-expect-error unsupported locale route param name should fail
const invalidSupportedLocaleRouteParamName: SupportedLocaleRouteSyntax =
  "region";

void invalidSupportedLocaleRouteParamName;

// @ts-expect-error placeholder params should be required when the message contains tokens
translator.t("common.greeting");

// @ts-expect-error missing placeholder param should fail
translator.t("common.greeting", {
  params: {},
});

// @ts-expect-error extra placeholder params should fail
translator.t("common.greeting", {
  params: {
    name: "Ada",
    role: "Admin",
  },
});

// @ts-expect-error placeholder names should be inferred from the message string
translator.t("common.formalGreeting", {
  params: {
    greeting: "Dr.",
    name: "Ada",
  },
});

// @ts-expect-error unsupported locale should fail
translator.loadLocale("pt");

configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  messages: {
    en,
  },
});

const optionalLocaleTranslator = await configureTranslations({
  availableLocales: ["en", "es", "fr"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  optionalLocales: ["es", "fr"],
  messages: {
    en,
    es: {
      common: {
        hello: "Hola",
      },
    },
  },
});

optionalLocaleTranslator.t("account.balance.label", { locale: "es" });
optionalLocaleTranslator.t("account.balance.label", { locale: "fr" });
optionalLocaleTranslator.loadLocale("fr");

await configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  optionalLocales: ["es"],
  languages: [
    {
      locale: "es",
      nativeLabel: "Español",
      optional: true,
      shortLabel: "ES",
    },
  ],
  messages: {
    en,
    es: {
      account: {
        balance: {
          label: "Saldo",
        },
      },
    },
  },
});

configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  optionalLocales: ["es"],
  messages: {
    en,
    // @ts-expect-error optional locale messages still reject extra keys
    es: {
      common: {
        hello: "Hola",
        extra: "Extra",
      },
    },
  },
});

const direction: TranslationDirection = translator.getDirection({
  locale: "es",
});
void direction;

// @ts-expect-error defaultLocale must be one of the available locales
configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "fr",
  messages: {
    en,
  },
});

const partialLoaderMessages = {
  en,
  es,
} satisfies TranslationLocaleMap<Locale, AppMessages>;

configureTranslations({
  availableLocales: ["en", "es", "fr"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: partialLoaderMessages,
  loaders: {
    fr: async () => ({
      common: {
        hello: "Bonjour",
      },
    }),
  },
});

configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  messages: {
    en,
    es,
  },
  directions: {
    es: "rtl",
  },
  languages: [
    {
      icon: "🇪🇸",
      locale: "es",
      nativeLabel: "Español",
      shortLabel: "ES",
    },
  ],
});

configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  messages: {
    en,
    es,
  },
  languages: [
    {
      // @ts-expect-error languages should reject locales outside the declared locale contract
      locale: "pt",
      nativeLabel: "Português",
      shortLabel: "PT",
    },
  ],
});

configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  messages: {
    en,
    es,
  },
  directions: {
    // @ts-expect-error directions should reject invalid direction values
    es: "sideways",
  },
});

configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  messages: {
    en,
    es,
  },
  directions: {
    // @ts-expect-error directions should reject locales outside the declared locale contract
    pt: "rtl",
  },
});

const missingNestedKey = {
  en,
  es: {
    common: {
      hello: "Hola",
      greeting: "Buenos dias {name}",
      formalGreeting: "{salute} {name}",
    },
    // @ts-expect-error preloaded locales must include every nested key from the source locale
    account: {},
  },
} satisfies TranslationLocaleMap<Locale, AppMessages>;

const extraNestedKey = {
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
        // @ts-expect-error preloaded locales cannot add extra nested keys
        total: "Total",
      },
    },
  },
} satisfies TranslationLocaleMap<Locale, AppMessages>;

const mismatchedLeafShape = {
  en,
  es: {
    // @ts-expect-error preloaded locales must keep leaf and object shapes aligned
    common: "Hola",
    account: {
      balance: {
        label: "Saldo",
      },
    },
  },
} satisfies TranslationLocaleMap<Locale, AppMessages>;

void missingNestedKey;
void extraNestedKey;
void mismatchedLeafShape;
