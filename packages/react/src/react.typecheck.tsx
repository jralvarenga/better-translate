import { configureTranslations } from "better-translate/core";

import { BetterTranslateProvider } from "./provider.js";
import { useTranslations } from "./use-translations.js";

const translator = await configureTranslations({
  availableLocales: ["en", "es", "fr"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  directions: {
    es: "rtl",
  },
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

function Consumer() {
  const translations = useTranslations<typeof translator>();

  translations.t("common.hello");
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

  translations.t("common.greeting", {
    params: {
      // @ts-expect-error placeholder names should be inferred from the source message
      user: "Ada",
    },
  });

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
