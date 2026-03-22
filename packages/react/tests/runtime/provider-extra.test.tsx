import { Component, type ReactNode, act } from "react";
import { describe, expect, it } from "bun:test";
import { create, type ReactTestRenderer } from "react-test-renderer";

import { configureTranslations } from "@better-translate/core";

import { BetterTranslateProvider } from "../../src/provider.js";
import { useTranslations } from "../../src/use-translations.js";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

class ErrorBoundary extends Component<
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

describe("@better-translate/react provider extras", () => {
  it("does not reload when setLocale receives the active locale", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: {
        en: {
          common: {
            hello: "Hello",
          },
        },
        es: {
          common: {
            hello: "Hola",
          },
        },
      },
    });
    let latestValue:
      | ReturnType<typeof useTranslations<typeof translator>>
      | undefined;
    let loadCalls = 0;
    const originalLoadLocale = translator.loadLocale.bind(translator);
    translator.loadLocale = (async (locale) => {
      loadCalls += 1;
      return originalLoadLocale(locale);
    }) as typeof translator.loadLocale;

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
      await latestValue?.setLocale("en");
    });

    expect(loadCalls).toBe(0);
    expect(latestValue?.locale).toBe("en");
  });

  it("resets locale state when the translator prop changes", async () => {
    const firstTranslator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: {
        en: {
          common: {
            hello: "Hello",
          },
        },
        es: {
          common: {
            hello: "Hola",
          },
        },
      },
    });
    const secondTranslator = await configureTranslations({
      availableLocales: ["en", "fr"] as const,
      defaultLocale: "fr",
      fallbackLocale: "fr",
      directions: {
        fr: "rtl",
      },
      messages: {
        en: {
          common: {
            hello: "Hello",
          },
        },
        fr: {
          common: {
            hello: "Bonjour",
          },
        },
      },
    });
    let latestValue:
      | ReturnType<typeof useTranslations<typeof firstTranslator>>
      | ReturnType<typeof useTranslations<typeof secondTranslator>>
      | undefined;
    let renderer: ReactTestRenderer | undefined;

    function Consumer() {
      latestValue = useTranslations();
      return null;
    }

    await act(async () => {
      renderer = create(
        <BetterTranslateProvider translator={firstTranslator}>
          <Consumer />
        </BetterTranslateProvider>,
      );
    });
    await act(async () => {
      await latestValue?.setLocale("es" as never);
    });

    expect(latestValue?.locale).toBe("es");

    await act(async () => {
      renderer?.update(
        <BetterTranslateProvider translator={secondTranslator}>
          <Consumer />
        </BetterTranslateProvider>,
      );
    });

    expect(latestValue?.locale).toBe("fr");
    expect(latestValue?.direction).toBe("rtl");
    expect(latestValue?.t("common.hello" as never)).toBe("Bonjour");
  });

  it("surfaces provider errors through an error boundary when a consumer is outside context", () => {
    let caughtError: unknown;

    function Consumer() {
      useTranslations();
      return null;
    }

    act(() => {
      create(
        <ErrorBoundary
          onError={(error) => {
            caughtError = error;
          }}
        >
          <Consumer />
        </ErrorBoundary>,
      );
    });

    expect(caughtError).toBeInstanceOf(Error);
  });
});
