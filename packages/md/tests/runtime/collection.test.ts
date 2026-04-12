import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { configureTranslations } from "@better-translate/core";

import {
  createMarkdownCollection,
  createMarkdownHelpers,
  MarkdownDocumentNotFoundError,
} from "../../src/index.js";

describe("@better-translate/md collection helpers", () => {
  let rootDir = "";

  beforeEach(async () => {
    rootDir = await mkdtemp(join(tmpdir(), "better-translate-md-collection-"));
  });

  afterEach(async () => {
    if (rootDir) {
      await rm(rootDir, {
        force: true,
        recursive: true,
      });
    }
  });

  it("returns an empty list when the default locale directory is missing", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en"] as const,
      defaultLocale: "en",
      messages: {
        en: {
          common: {
            hello: "Hello",
          },
        },
      },
    });
    const collection = createMarkdownCollection({
      rootDir,
      translator,
    });

    await expect(collection.listDocuments()).resolves.toEqual([]);
  });

  it("rejects invalid configuration and escaping document ids", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en"] as const,
      defaultLocale: "en",
      messages: {
        en: {
          common: {
            hello: "Hello",
          },
        },
      },
    });

    expect(() =>
      createMarkdownHelpers(translator, {
        extensions: [] as never,
        rootDir,
      }),
    ).toThrow("Markdown helpers require at least one supported extension.");
    expect(() =>
      createMarkdownHelpers(translator, {
        extensions: [".txt" as never],
        rootDir,
      }),
    ).toThrow('Markdown helpers only support ".md" and ".mdx" extensions.');

    const docs = createMarkdownHelpers(translator, {
      rootDir,
    });

    await expect(docs.getDocument("../escape")).rejects.toThrow(
      'Markdown document id "../escape" cannot escape the configured rootDir.',
    );
  });

  it("tracks looked-up paths when no localized or fallback document exists", async () => {
    await mkdir(join(rootDir, "en", "docs"), {
      recursive: true,
    });
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
    const collection = createMarkdownCollection({
      rootDir,
      translator,
    });

    try {
      await collection.getDocument("docs/missing", {
        locale: "es",
      });
      throw new Error("Expected getDocument to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(MarkdownDocumentNotFoundError);
      const typedError = error as MarkdownDocumentNotFoundError;
      expect(typedError.requestedLocale).toBe("es");
      expect(typedError.fallbackLocale).toBe("en");
      expect(typedError.lookedUpPaths).toEqual([
        join(rootDir, "es", "docs", "missing.mdx"),
        join(rootDir, "es", "docs", "missing.md"),
        join(rootDir, "en", "docs", "missing.mdx"),
        join(rootDir, "en", "docs", "missing.md"),
      ]);
    }
  });

  it("normalizes windows-style document ids and preserves fallback metadata", async () => {
    await mkdir(join(rootDir, "en", "guides"), {
      recursive: true,
    });
    await writeFile(
      join(rootDir, "en", "guides", "intro.md"),
      "# Intro\n",
      "utf8",
    );
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
    const collection = createMarkdownCollection({
      rootDir,
      translator,
    });

    const document = await collection.getDocument("guides\\intro", {
      locale: "es",
    });

    expect(document.id).toBe("guides/intro");
    expect(document.locale).toBe("en");
    expect(document.requestedLocale).toBe("es");
    expect(document.usedFallback).toBe(true);
  });

  it("rethrows non-ENOENT access errors when checking locale candidates", async () => {
    await mkdir(join(rootDir, "en", "docs"), {
      recursive: true,
    });
    await writeFile(
      join(rootDir, "en", "docs", "intro.md"),
      "# Intro\n",
      "utf8",
    );
    await writeFile(join(rootDir, "es"), "not-a-directory", "utf8");
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
    const collection = createMarkdownCollection({
      rootDir,
      translator,
    });

    await expect(
      collection.getDocument("docs/intro", {
        locale: "es",
      }),
    ).rejects.toThrow(/ENOTDIR|not a directory/i);
  });
});
