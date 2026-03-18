import { Component, type ReactNode, act } from "react";
import { describe, expect, it } from "bun:test";
import { create } from "react-test-renderer";

import { configureTranslations } from "better-translate/core";

import { BetterTranslateProvider } from "../../src/provider.js";
import { useTranslations } from "../../src/use-translations.js";

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

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

class TestErrorBoundary extends Component<
  { children: ReactNode; onError(error: unknown): void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

describe("@better-translate/react", () => {
  it("renders with the default locale", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
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
      messages: { en, es },
    });

    let latestValue:
      | ReturnType<typeof useTranslations<typeof translator>>
      | undefined;

    function Consumer() {
      latestValue = useTranslations<typeof translator>();
      return null;
    }

    await act(async () => {
      create(
        <BetterTranslateProvider translator={translator}>
          <Consumer />
        </BetterTranslateProvider>,
      );
    });

    expect(latestValue?.locale).toBe("en");
    expect(latestValue?.direction).toBe("ltr");
    expect(latestValue?.rtl).toBe(false);
    expect(latestValue?.availableLanguages).toEqual([
      {
        icon: "🇪🇸",
        locale: "es",
        nativeLabel: "Español",
        shortLabel: "ES",
      },
      {
        locale: "en",
        nativeLabel: "en",
        shortLabel: "EN",
      },
    ]);
    expect(latestValue?.t("common.hello")).toBe("Hello");
    expect(
      latestValue?.t("common.greeting", {
        params: {
          name: "Ada",
        },
      }),
    ).toBe("Good morning Ada");
    expect(latestValue?.messages).toEqual({ en, es });
  });

  it("supports overriding the initial locale", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      directions: {
        es: "rtl",
      },
      messages: { en, es },
    });

    let latestValue:
      | ReturnType<typeof useTranslations<typeof translator>>
      | undefined;

    function Consumer() {
      latestValue = useTranslations<typeof translator>();
      return null;
    }

    await act(async () => {
      create(
        <BetterTranslateProvider translator={translator} initialLocale="es">
          <Consumer />
        </BetterTranslateProvider>,
      );
    });

    expect(latestValue?.locale).toBe("es");
    expect(latestValue?.direction).toBe("rtl");
    expect(latestValue?.t("common.hello")).toBe("Hola");
    expect(latestValue?.defaultLocale).toBe("en");
    expect(latestValue?.rtl).toBe(true);
  });

  it("switches to a cached locale", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      directions: {
        es: "rtl",
      },
      messages: { en, es },
    });

    let latestValue:
      | ReturnType<typeof useTranslations<typeof translator>>
      | undefined;

    function Consumer() {
      latestValue = useTranslations<typeof translator>();
      return null;
    }

    await act(async () => {
      create(
        <BetterTranslateProvider translator={translator}>
          <Consumer />
        </BetterTranslateProvider>,
      );
    });

    await act(async () => {
      await latestValue?.setLocale("es");
    });

    expect(latestValue?.locale).toBe("es");
    expect(latestValue?.direction).toBe("rtl");
    expect(latestValue?.rtl).toBe(true);
    expect(latestValue?.t("common.hello")).toBe("Hola");
  });

  it("auto-loads a locale before switching to it", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "fr"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: { en },
      loaders: {
        fr: async () => ({
          common: {
            hello: "Bonjour",
          },
          account: {
            balance: {
              label: "Solde",
            },
          },
        }),
      },
    });

    let latestValue:
      | ReturnType<typeof useTranslations<typeof translator>>
      | undefined;

    function Consumer() {
      latestValue = useTranslations<typeof translator>();
      return null;
    }

    await act(async () => {
      create(
        <BetterTranslateProvider translator={translator}>
          <Consumer />
        </BetterTranslateProvider>,
      );
    });

    await act(async () => {
      await latestValue?.setLocale("fr");
    });

    expect(latestValue?.locale).toBe("fr");
    expect(latestValue?.t("common.hello")).toBe("Bonjour");
    expect(latestValue?.messages).toEqual({
      en,
      fr: {
        common: {
          hello: "Bonjour",
        },
        account: {
          balance: {
            label: "Solde",
          },
        },
      },
    });
  });

  it("keeps the previous locale and exposes localeError when loading fails", async () => {
    const failure = new Error("Locale failed to load");
    const translator = await configureTranslations({
      availableLocales: ["en", "fr"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: { en },
      loaders: {
        fr: async () => {
          throw failure;
        },
      },
    });

    let latestValue:
      | ReturnType<typeof useTranslations<typeof translator>>
      | undefined;

    function Consumer() {
      latestValue = useTranslations<typeof translator>();
      return null;
    }

    await act(async () => {
      create(
        <BetterTranslateProvider translator={translator}>
          <Consumer />
        </BetterTranslateProvider>,
      );
    });

    await act(async () => {
      await latestValue?.setLocale("fr");
    });

    expect(latestValue?.locale).toBe("en");
    expect(latestValue?.localeError).toBe(failure);
  });

  it("loads locale messages without switching locale", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "fr"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: { en },
      loaders: {
        fr: async () => ({
          common: {
            hello: "Bonjour",
          },
        }),
      },
    });

    let latestValue:
      | ReturnType<typeof useTranslations<typeof translator>>
      | undefined;

    function Consumer() {
      latestValue = useTranslations<typeof translator>();
      return null;
    }

    await act(async () => {
      create(
        <BetterTranslateProvider translator={translator}>
          <Consumer />
        </BetterTranslateProvider>,
      );
    });

    await act(async () => {
      await latestValue?.loadLocale("fr");
    });

    expect(latestValue?.locale).toBe("en");
    expect(latestValue?.messages).toEqual({
      en,
      fr: {
        common: {
          hello: "Bonjour",
        },
      },
    });
  });

  it("interpolates params through the locale-bound t helper", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      directions: {
        es: "rtl",
      },
      messages: { en, es },
    });

    let latestValue:
      | ReturnType<typeof useTranslations<typeof translator>>
      | undefined;

    function Consumer() {
      latestValue = useTranslations<typeof translator>();
      return null;
    }

    await act(async () => {
      create(
        <BetterTranslateProvider translator={translator} initialLocale="es">
          <Consumer />
        </BetterTranslateProvider>,
      );
    });

    expect(
      latestValue?.t("common.formalGreeting", {
        params: {
          salute: "Dra.",
          name: "Ada",
        },
      }),
    ).toBe("Dra. Ada");
    expect(
      latestValue?.t("common.hello", {
        config: {
          rtl: false,
        },
      }),
    ).toBe("Hola");
    expect(latestValue?.translator.getDirection({ locale: "es" })).toBe("rtl");
    expect(
      latestValue?.translator.getDirection({
        locale: "es",
        config: {
          rtl: false,
        },
      }),
    ).toBe("ltr");
  });

  it("throws when used outside the provider", () => {
    let capturedError: unknown;

    function Consumer() {
      useTranslations();
      return null;
    }

    act(() => {
      create(
        <TestErrorBoundary
          onError={(error) => {
            capturedError = error;
          }}
        >
          <Consumer />
        </TestErrorBoundary>,
      );
    });

    expect(capturedError).toBeInstanceOf(Error);
    expect((capturedError as Error).message).toBe(
      "useTranslations() must be used inside <BetterTranslateProvider />.",
    );
  });
});
