import { afterEach, describe, expect, it } from "bun:test";

import {
  configureTranslations,
  createTranslationJsonSchema,
  getMessages,
  getSupportedLocales,
  loadLocale,
  resetTranslationsForTests,
  t,
} from "./core.js";
import { readConfiguredTranslationsFromAnotherFile } from "./cross-file-access.js";

const en = {
  common: {
    hello: "Hello",
    goodbye: "Goodbye",
    greeting: "Good morning {name}",
    formalGreeting: "{salute} {name}",
    repeatedGreeting: "Hello {name}, {name}!",
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
    goodbye: "Adios",
    greeting: "Buenos dias {name}",
    formalGreeting: "{salute} {name}",
    repeatedGreeting: "Hola {name}, {name}!",
  },
  account: {
    balance: {
      label: "Saldo",
    },
  },
} as const;

describe("better-translate core", () => {
  afterEach(() => {
    resetTranslationsForTests();
  });

  it("supports the short configuration form", async () => {
    const translator = await configureTranslations({ en, es });

    expect(translator.defaultLocale).toBe("en");
    expect(translator.t("common.hello")).toBe("Hello");
    expect(translator.t("common.hello", { locale: "es" })).toBe("Hola");
    expect(
      translator.t("common.greeting", {
        params: {
          name: "Ada",
        },
      }),
    ).toBe("Good morning Ada");
    expect(translator.getMessages()).toEqual({ en, es });
  });

  it("falls back to the source locale and then to the key", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: { en },
      loaders: {
        es: async () => ({
          common: {
            hello: "Hola",
          },
        }),
      },
    });

    await translator.loadLocale("es");

    expect(translator.t("account.balance.label", { locale: "es" })).toBe(
      "Balance",
    );
    expect(translator.t("account.unknown.label" as never)).toBe(
      "account.unknown.label",
    );
  });

  it("interpolates multiple params and repeated placeholders", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: { en, es },
    });

    expect(
      translator.t("common.formalGreeting", {
        params: {
          salute: "Dr.",
          name: "Ada",
        },
      }),
    ).toBe("Dr. Ada");
    expect(
      translator.t("common.repeatedGreeting", {
        params: {
          name: "Ada",
        },
      }),
    ).toBe("Hello Ada, Ada!");
  });

  it("interpolates fallback messages with params", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: { en },
      loaders: {
        es: async () => ({
          common: {
            hello: "Hola",
          },
        }),
      },
    });

    await translator.loadLocale("es");

    expect(
      translator.t("common.greeting", {
        locale: "es",
        params: {
          name: "Ada",
        },
      }),
    ).toBe("Good morning Ada");
  });

  it("warns and replaces missing params with an empty string", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: { en, es },
    });
    const originalWarn = console.warn;
    const warnings: string[] = [];

    console.warn = (...args) => {
      warnings.push(args.join(" "));
    };

    try {
      expect(
        translator.t(
          "common.formalGreeting",
          {
            params: {
              salute: "Dr.",
            },
          } as never,
        ),
      ).toBe("Dr. ");
      expect(warnings).toEqual([
        'Missing translation param "{name}" for key "common.formalGreeting".',
      ]);
    } finally {
      console.warn = originalWarn;
    }
  });

  it("does not interpolate unresolved keys returned as-is", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: { en, es },
    });

    expect(
      translator.t(
        "common.unknown.{name}" as never,
        {
          params: {
            name: "Ada",
          },
        } as never,
      ),
    ).toBe("common.unknown.{name}");
  });

  it("loads async locales once and exposes them globally", async () => {
    let loadCount = 0;

    await configureTranslations({
      availableLocales: ["en", "fr"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: { en },
      loaders: {
        fr: async () => {
          loadCount += 1;
          return {
            common: {
              hello: "Bonjour",
            },
          };
        },
      },
    });

    await loadLocale("fr");
    await loadLocale("fr");

    expect(loadCount).toBe(1);
    expect(t("common.hello", { locale: "fr" })).toBe("Bonjour");
    expect(getSupportedLocales()).toEqual(["en", "fr"]);
    expect(getMessages()).toEqual({
      en,
      fr: {
        common: {
          hello: "Bonjour",
        },
      },
    });
  });

  it("shares configured messages across files without reconfiguration", async () => {
    await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: { en, es },
    });

    expect(readConfiguredTranslationsFromAnotherFile()).toEqual({
      messages: { en, es },
      greeting: "Hello",
    });
  });

  it("returns an isolated snapshot from getMessages()", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: { en, es },
    });

    const messages = translator.getMessages() as Record<string, unknown>;

    expect(() => {
      messages.en = "mutated";
    }).toThrow();

    expect(translator.getMessages()).toEqual({ en, es });
    expect(getMessages()).toEqual({ en, es });
  });

  it("rejects locales outside the declared availableLocales list", async () => {
    await expect(
      configureTranslations({
        availableLocales: ["en", "es"] as const,
        defaultLocale: "en",
        messages: {
          en,
          fr: {
            common: {
              hello: "Bonjour",
            },
          },
        },
      } as const),
    ).rejects.toThrow(
      'The locale "fr" is present in messages but not in availableLocales.',
    );
  });

  it("throws before configuration", () => {
    expect(() => t("common.hello")).toThrow(
      'Translations have not been configured. Call configureTranslations(...) before using "t(...)".',
    );
    expect(() => getMessages()).toThrow(
      'Translations have not been configured. Call configureTranslations(...) before using "t(...)".',
    );
  });

  it("creates a JSON schema from a source locale", () => {
    expect(createTranslationJsonSchema(en)).toEqual({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      additionalProperties: false,
      required: ["common", "account"],
      properties: {
        common: {
          type: "object",
          additionalProperties: false,
          required: [
            "hello",
            "goodbye",
            "greeting",
            "formalGreeting",
            "repeatedGreeting",
          ],
          properties: {
            hello: {
              type: "string",
            },
            goodbye: {
              type: "string",
            },
            greeting: {
              type: "string",
            },
            formalGreeting: {
              type: "string",
            },
            repeatedGreeting: {
              type: "string",
            },
          },
        },
        account: {
          type: "object",
          additionalProperties: false,
          required: ["balance"],
          properties: {
            balance: {
              type: "object",
              additionalProperties: false,
              required: ["label"],
              properties: {
                label: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    });
  });
});
