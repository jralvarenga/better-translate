import type {
  DeepStringify,
  DotKeys,
  SupportedLocaleRouteSyntax,
  TranslationDirection,
  TranslationLanguageMetadata,
  TranslationLocaleMap,
} from "@better-translate/core";
import {
  configureTranslations,
  getAvailableLanguages,
  getMessages,
  SUPPORTED_LOCALE_ROUTE_SYNTAXES,
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
const configuredLanguageLocale: Locale | "fr" = configuredLanguages[0]!.locale;
const configuredLanguage: TranslationLanguageMetadata<Locale | "fr"> =
  configuredLanguages[0]!;
void configuredLanguageLocale;
void configuredLanguage;
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

translator.t("common.greeting", {
  // @ts-expect-error missing placeholder param should fail
  params: {},
});

translator.t("common.greeting", {
  params: {
    name: "Ada",
    // @ts-expect-error extra placeholder params should fail
    role: "Admin",
  },
});

translator.t("common.formalGreeting", {
  params: {
    // @ts-expect-error placeholder names should be inferred from the message string
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

// @ts-expect-error languages should reject locales outside the declared locale contract
configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  messages: {
    en,
    es,
  },
  languages: [
    {
      locale: "pt",
      nativeLabel: "Português",
      shortLabel: "PT",
    },
  ],
});

// @ts-expect-error directions should reject invalid direction values
configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  messages: {
    en,
    es,
  },
  directions: {
    es: "sideways",
  },
});

// @ts-expect-error directions should reject locales outside the declared locale contract
configureTranslations({
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  messages: {
    en,
    es,
  },
  directions: {
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
