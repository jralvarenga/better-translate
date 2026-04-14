import { describe, expect, it } from "bun:test";

import { createConfiguredTranslator } from "../../src/create-configured-translator.js";
import { createTranslationJsonSchema } from "../../src/create-translation-json-schema.js";
import { interpolateMessage } from "../../src/interpolate-message.js";
import { normalizeConfig } from "../../src/normalize-config.js";
import { resolveMessageValue } from "../../src/resolve-message-value.js";
import { snapshotLanguages } from "../../src/snapshot-languages.js";
import {
  getRequestLocale,
  resolveRequestLocale,
  setRequestLocale,
} from "../../src/server.js";
import { snapshotMessages } from "../../src/snapshot-messages.js";
import { SUPPORTED_LOCALE_ROUTE_SYNTAXES } from "../../src/core.js";
import {
  isTranslationConfigOptions,
  isTranslationMessages,
} from "../../src/validation.js";

const en = {
  common: {
    hello: "Hello",
    repeated: "Hello {name} {name}",
  },
} as const;

describe("better-translate internals", () => {
  it("exports the supported locale route param names in a stable order", () => {
    expect(SUPPORTED_LOCALE_ROUTE_SYNTAXES).toEqual([
      "locale",
      "lang",
      "language",
      "intl",
      "i18n",
      "l10n",
      "localization",
    ]);
  });

  it("detects the options config form and validates translation objects", () => {
    expect(
      isTranslationConfigOptions({
        availableLocales: ["en"],
        defaultLocale: "en",
        messages: {
          en,
        },
      }),
    ).toBe(true);
    expect(isTranslationConfigOptions({ en })).toBe(false);

    expect(isTranslationMessages(en)).toBe(true);
    expect(
      isTranslationMessages({
        nested: {
          maybe: undefined,
        },
      }),
    ).toBe(true);
    expect(isTranslationMessages(["hello"])).toBe(false);
    expect(isTranslationMessages({ invalid: 123 })).toBe(false);
  });

  it("normalizes short and long config forms and rejects invalid locale declarations", () => {
    expect(
      normalizeConfig({
        en,
        es: {
          common: {
            hello: "Hola",
          },
        },
      }),
    ).toMatchObject({
      defaultLocale: "en",
      fallbackLocale: "en",
      languages: [
        {
          locale: "en",
          nativeLabel: "en",
          shortLabel: "EN",
        },
        {
          locale: "es",
          nativeLabel: "es",
          shortLabel: "ES",
        },
      ],
      supportedLocales: ["en", "es"],
    });

    expect(() => normalizeConfig({})).toThrow(
      "configureTranslations(...) requires at least one locale.",
    );
    expect(() =>
      normalizeConfig({
        availableLocales: ["en"] as const,
        defaultLocale: "es",
        messages: {
          en,
        },
      }),
    ).toThrow('The default locale "es" is not included in availableLocales.');
    expect(() =>
      normalizeConfig({
        availableLocales: ["en"] as const,
        defaultLocale: "en",
        fallbackLocale: "es" as never,
        messages: {
          en,
        },
      }),
    ).toThrow('The fallback locale "es" is not included in availableLocales.');
    expect(() =>
      normalizeConfig({
        availableLocales: ["en", "es"] as const,
        defaultLocale: "en",
        messages: {},
      }),
    ).toThrow('Missing source messages for default locale "en".');
    expect(() =>
      normalizeConfig({
        availableLocales: ["en"] as const,
        defaultLocale: "en",
        messages: {
          en,
        },
        loaders: {
          es: async () => en,
        },
      } as const),
    ).toThrow(
      'The locale "es" is present in loaders but not in availableLocales.',
    );
    expect(() =>
      normalizeConfig({
        availableLocales: ["en", "es"] as const,
        defaultLocale: "en",
        messages: {
          en,
          es: {
            common: {
              hello: "Hola",
            },
          },
        },
        languages: [
          {
            locale: "es",
            nativeLabel: "Español",
            shortLabel: "ES",
          },
          {
            locale: "es",
            nativeLabel: "Spanish",
            shortLabel: "ES",
          },
        ],
      }),
    ).toThrow('Duplicate locale "es" found in languages config.');
  });

  it("resolves nested message values and interpolates repeated placeholders", () => {
    expect(resolveMessageValue(en, "common.hello")).toBe("Hello");
    expect(resolveMessageValue(en, "common.missing")).toBeUndefined();
    expect(
      resolveMessageValue(
        {
          common: "not-nested",
        } as never,
        "common.hello",
      ),
    ).toBeUndefined();

    const warnings: string[] = [];
    const originalWarn = console.warn;
    console.warn = (...args) => {
      warnings.push(args.join(" "));
    };

    try {
      expect(
        interpolateMessage("Hello {name} {count}", "common.hello", {
          count: 2,
          name: "Ada",
        }),
      ).toBe("Hello Ada 2");
      expect(
        interpolateMessage("Missing {name} {name}", "common.repeated"),
      ).toBe("Missing  ");
      expect(warnings).toEqual([
        'Missing translation param "{name}" for key "common.repeated".',
      ]);
    } finally {
      console.warn = originalWarn;
    }
  });

  it("creates immutable message snapshots", () => {
    const snapshot = snapshotMessages({
      en: {
        common: {
          hello: "Hello",
        },
      },
    });

    expect(snapshot).toEqual({
      en: {
        common: {
          hello: "Hello",
        },
      },
    });
    expect(() => {
      (snapshot as Record<string, unknown>).en = {};
    }).toThrow();
    expect(() => {
      (snapshot.en.common as Record<string, unknown>).hello = "Hola";
    }).toThrow();
  });

  it("creates immutable language snapshots", () => {
    const snapshot = snapshotLanguages([
      {
        icon: "🇪🇸",
        locale: "es",
        nativeLabel: "Español",
        shortLabel: "ES",
      },
    ]);

    expect(snapshot).toEqual([
      {
        icon: "🇪🇸",
        locale: "es",
        nativeLabel: "Español",
        shortLabel: "ES",
      },
    ]);
    expect(() => {
      (snapshot as Array<unknown>).push({});
    }).toThrow();
    expect(() => {
      (
        snapshot[0] as {
          nativeLabel: string;
        }
      ).nativeLabel = "Spanish";
    }).toThrow();
  });

  it("resolves request locales by precedence and validates supported locales", () => {
    const translator = createConfiguredTranslator(
      normalizeConfig({
        availableLocales: ["en", "es"] as const,
        defaultLocale: "en",
        fallbackLocale: "en",
        messages: {
          en,
          es: {
            common: {
              hello: "Hola",
            },
          },
        },
      }),
    );

    expect(
      resolveRequestLocale(translator, {
        configLocale: "es",
      }),
    ).toBe("es");
    expect(
      resolveRequestLocale(translator, {
        configLocale: "es",
        locale: "en",
        requestLocale: "es",
      }),
    ).toBe("en");
    expect(
      resolveRequestLocale(translator, {
        configLocale: "en",
        requestLocale: "es",
      }),
    ).toBe("es");
    expect(() =>
      resolveRequestLocale(translator, {
        requestLocale: "fr",
      }),
    ).toThrow(
      'The locale "fr" is not included in the translator\'s supported locales.',
    );

    setRequestLocale(undefined);
  });

  it("stores and clears the request locale", () => {
    setRequestLocale("es");
    expect(getRequestLocale()).toBe("es");

    setRequestLocale(undefined);
    expect(getRequestLocale()).toBeUndefined();
  });

  it("rejects invalid schema inputs and invalid loader payloads", async () => {
    expect(() =>
      createTranslationJsonSchema({
        invalid: 1,
      } as never),
    ).toThrow(
      "createTranslationJsonSchema(...) requires a valid translation object.",
    );

    const translator = createConfiguredTranslator(
      normalizeConfig({
        availableLocales: ["en", "fr"] as const,
        defaultLocale: "en",
        fallbackLocale: "en",
        messages: {
          en,
        },
        loaders: {
          fr: async () => "bonjour" as never,
        },
      }),
    );

    await expect(translator.loadLocale("es" as never)).resolves.toBeUndefined();
    await expect(translator.loadLocale("fr")).rejects.toThrow(
      'Locale "fr" did not resolve to a valid translation object.',
    );
  });
});
