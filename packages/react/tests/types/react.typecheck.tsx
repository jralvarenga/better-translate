import { configureTranslations } from "@better-translate/core";

import {
  BetterTranslateProvider,
  createBetterTranslateReact,
  useTranslations,
} from "../../dist/index.js";

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
  messages: {
    en: {
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
    },
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
} as const);

type AppTranslator = typeof translator;

declare module "../../dist/index.js" {
  interface BetterTranslateReactTypes {
    translator: AppTranslator;
  }
}

function Consumer() {
  const translations = useTranslations<typeof translator>();

  translations.t("common.hello");
  translations.t("Welcome back", { bt: true });
  translations.t("Welcome {name}", {
    bt: true,
    params: {
      name: "Ada",
    },
  });
  translations.t("account.balance.label");
  translations.t("common.greeting", {
    params: {
      name: "Ada",
    },
  });
  translations.t("common.formalGreeting", {
    params: {
      salute: "Dr.",
      name: "Ada",
    },
  });
  void translations.setLocale("es");
  void translations.loadLocale("fr");
  translations.availableLanguages[0]?.locale;
  translations.direction;
  translations.messages.en;
  translations.messages.fr;
  translations.rtl;
  translations.translator.getDirection({ locale: "es" });
  translations.translator.isRtl({
    config: {
      rtl: true,
    },
  });
  translations.t("common.hello", {
    config: {
      rtl: false,
    },
  });

  // @ts-expect-error invalid translation key should fail
  translations.t("account.balance.total");

  // @ts-expect-error messages with placeholders should require params
  translations.t("common.greeting");

  // @ts-expect-error placeholder names should be inferred from the source message
  translations.t("common.greeting", {
    params: {
      user: "Ada",
    },
  });

  // @ts-expect-error unsupported locale should fail
  void translations.setLocale("pt");

  return null;
}

function AugmentedConsumer() {
  const translations = useTranslations();

  translations.t("common.hello");
  translations.t("Welcome back", { bt: true });
  translations.t("Welcome {name}", {
    bt: true,
    params: {
      name: "Ada",
    },
  });
  translations.t("account.balance.label");
  translations.t("common.greeting", {
    params: {
      name: "Ada",
    },
  });
  translations.t("common.formalGreeting", {
    params: {
      salute: "Dr.",
      name: "Ada",
    },
  });
  void translations.setLocale("es");
  void translations.loadLocale("fr");
  translations.availableLanguages[0]?.locale;
  translations.direction;
  translations.messages.en;
  translations.messages.fr;
  translations.rtl;
  translations.translator.getDirection({ locale: "es" });
  translations.translator.isRtl({
    config: {
      rtl: true,
    },
  });
  translations.t("common.hello", {
    config: {
      rtl: false,
    },
  });

  // @ts-expect-error invalid translation key should fail
  translations.t("account.balance.total");

  // @ts-expect-error messages with placeholders should require params
  translations.t("common.greeting");

  // @ts-expect-error placeholder names should be inferred from the source message
  translations.t("common.greeting", {
    params: {
      user: "Ada",
    },
  });

  // @ts-expect-error unsupported locale should fail
  void translations.setLocale("pt");

  return null;
}

const {
  BetterTranslateProvider: TypedBetterTranslateProvider,
  useTranslations: useTypedTranslations,
} = createBetterTranslateReact(translator);

function FactoryConsumer() {
  const translations = useTypedTranslations();

  translations.t("common.hello");
  translations.t("account.balance.label");
  void translations.setLocale("es");
  void translations.loadLocale("fr");
  translations.availableLanguages[0]?.locale;
  translations.messages.en;
  translations.messages.fr;
  translations.supportedLocales[0];

  // @ts-expect-error invalid translation key should fail
  translations.t("account.balance.total");

  // @ts-expect-error unsupported locale should fail
  void translations.setLocale("pt");

  return null;
}

<BetterTranslateProvider translator={translator}>
  <Consumer />
</BetterTranslateProvider>;

<BetterTranslateProvider translator={translator}>
  <AugmentedConsumer />
</BetterTranslateProvider>;

<TypedBetterTranslateProvider>
  <FactoryConsumer />
</TypedBetterTranslateProvider>;

<TypedBetterTranslateProvider initialLocale="es">
  <FactoryConsumer />
</TypedBetterTranslateProvider>;

<TypedBetterTranslateProvider translator={translator}>
  <FactoryConsumer />
</TypedBetterTranslateProvider>;

// @ts-expect-error initialLocale must be a supported locale
<TypedBetterTranslateProvider initialLocale="pt">
  <FactoryConsumer />
</TypedBetterTranslateProvider>;

<BetterTranslateProvider translator={translator} initialLocale="es">
  <Consumer />
</BetterTranslateProvider>;

// @ts-expect-error initialLocale must be a supported locale
<BetterTranslateProvider translator={translator} initialLocale="pt">
  <Consumer />
</BetterTranslateProvider>;
