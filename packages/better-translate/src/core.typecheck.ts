import type {
  DeepStringify,
  DotKeys,
  TranslationLocaleMap,
} from "./core.js";
import { configureTranslations, getMessages } from "./core.js";

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

const es = {
  common: {
    hello: "Hola",
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
translator.t(translationKey, { locale: "es" });
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
    en,
  },
});

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

const missingNestedKey = {
  en,
  // @ts-expect-error preloaded locales must include every nested key from the source locale
  es: {
    common: {
      hello: "Hola",
    },
  },
} satisfies TranslationLocaleMap<Locale, AppMessages>;

const extraNestedKey = {
  en,
  es: {
    common: {
      hello: "Hola",
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
