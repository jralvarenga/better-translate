import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { configureTranslations } from "better-translate/core";
import { setRequestLocale } from "better-translate/server";

import {
  createMarkdownHelpers,
  MarkdownDocumentNotFoundError,
} from "./index.js";
import { createMarkdownServerHelpers } from "./server.js";

const en = {
  common: {
    hello: "Hello",
  },
} as const;

const es = {
  common: {
    hello: "Hola",
  },
} as const;

describe("@better-translate/md", () => {
  let rootDir = "";

  beforeEach(async () => {
    rootDir = await mkdtemp(join(tmpdir(), "better-translate-md-"));
    setRequestLocale(undefined);
  });

  afterEach(async () => {
    setRequestLocale(undefined);
    if (rootDir) {
      await rm(rootDir, {
        force: true,
        recursive: true,
      });
    }
  });

  it("loads localized markdown documents from a configured translator", async () => {
    await mkdir(join(rootDir, "en", "docs"), {
      recursive: true,
    });
    await mkdir(join(rootDir, "es", "docs"), {
      recursive: true,
    });
    await writeFile(
      join(rootDir, "en", "docs", "guide.md"),
      `---
title: English guide
---
# Hello

Welcome.
`,
    );
    await writeFile(
      join(rootDir, "es", "docs", "guide.md"),
      `---
title: Guia
---
# Hola

Bienvenido.
`,
    );

    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: {
        en,
        es,
      },
    });
    const docs = createMarkdownHelpers(translator, {
      rootDir,
    });

    const document = await docs.getDocument("docs/guide", {
      locale: "es",
    });

    expect(document.locale).toBe("es");
    expect(document.kind).toBe("md");
    expect(document.frontmatter).toEqual({
      title: "Guia",
    });
    expect(document.source).toContain("Bienvenido.");
  });

  it("falls back to the translator fallback locale", async () => {
    await mkdir(join(rootDir, "en", "docs"), {
      recursive: true,
    });
    await writeFile(
      join(rootDir, "en", "docs", "guide.mdx"),
      `---
title: English guide
---
# Hello

<Callout>Fallback</Callout>
`,
    );

    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: {
        en,
      },
      loaders: {
        es: async () => es,
      },
    });
    const docs = createMarkdownHelpers(translator, {
      rootDir,
    });

    const document = await docs.getDocument("docs/guide", {
      locale: "es",
    });

    expect(document.locale).toBe("en");
    expect(document.requestedLocale).toBe("es");
    expect(document.usedFallback).toBe(true);
    expect(document.kind).toBe("mdx");
  });

  it("lists documents from the default locale directory", async () => {
    await mkdir(join(rootDir, "en", "docs"), {
      recursive: true,
    });
    await mkdir(join(rootDir, "es", "docs"), {
      recursive: true,
    });
    await writeFile(join(rootDir, "en", "docs", "guide.md"), "# Hello\n");
    await writeFile(join(rootDir, "en", "docs", "intro.mdx"), "# Intro\n");
    await writeFile(join(rootDir, "es", "docs", "guide.md"), "# Hola\n");

    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: {
        en,
        es,
      },
    });
    const docs = createMarkdownHelpers(translator, {
      rootDir,
    });

    await expect(docs.listDocuments()).resolves.toEqual([
      "docs/guide",
      "docs/intro",
    ]);
  });

  it("compiles markdown documents to HTML", async () => {
    await mkdir(join(rootDir, "en", "docs"), {
      recursive: true,
    });
    await writeFile(
      join(rootDir, "en", "docs", "guide.md"),
      "# Hello\n\nA [link](https://example.com).\n",
    );

    const translator = await configureTranslations({
      availableLocales: ["en"] as const,
      defaultLocale: "en",
      messages: {
        en,
      },
    });
    const docs = createMarkdownHelpers(translator, {
      rootDir,
    });

    const compiled = await docs.compileDocument("docs/guide");

    expect(compiled.kind).toBe("md");
    expect(compiled.html).toContain("<h1>Hello</h1>");
    expect(compiled.html).toContain('<a href="https://example.com">link</a>');
  });

  it("compiles mdx documents to module code", async () => {
    await mkdir(join(rootDir, "en", "docs"), {
      recursive: true,
    });
    await writeFile(
      join(rootDir, "en", "docs", "guide.mdx"),
      "# Hello\n\n<Callout>MDX</Callout>\n",
    );

    const translator = await configureTranslations({
      availableLocales: ["en"] as const,
      defaultLocale: "en",
      messages: {
        en,
      },
    });
    const docs = createMarkdownHelpers(translator, {
      rootDir,
    });

    const compiled = await docs.compileDocument("docs/guide");

    expect(compiled.kind).toBe("mdx");
    expect(compiled.code).toContain("MDXContent");
    expect(compiled.code).toContain("Callout");
  });

  it("throws a typed error when the document is missing", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: {
        en,
        es,
      },
    });
    const docs = createMarkdownHelpers(translator, {
      rootDir,
    });

    await expect(
      docs.getDocument("docs/missing", {
        locale: "es",
      }),
    ).rejects.toBeInstanceOf(MarkdownDocumentNotFoundError);
  });

  it("rejects unsupported locales from callers", async () => {
    const translator = await configureTranslations({
      availableLocales: ["en"] as const,
      defaultLocale: "en",
      messages: {
        en,
      },
    });
    const docs = createMarkdownHelpers(translator, {
      rootDir,
    });

    await expect(
      docs.getDocument("docs/guide", {
        locale: "es" as never,
      }),
    ).rejects.toThrow(
      'The locale "es" is not included in the translator\'s supported locales.',
    );
  });

  it("works with request-config based server helpers", async () => {
    await mkdir(join(rootDir, "en", "docs"), {
      recursive: true,
    });
    await writeFile(
      join(rootDir, "en", "docs", "guide.md"),
      `---
title: Hello
---
# Hello
`,
    );

    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: {
        en,
        es,
      },
    });
    const docs = createMarkdownServerHelpers(
      async () => ({
        translator,
      }),
      {
        rootDir,
      },
    );

    setRequestLocale("es");

    const document = await docs.getDocument("docs/guide");
    const compiled = await docs.compileDocument("docs/guide");

    expect(document.requestedLocale).toBe("es");
    expect(document.usedFallback).toBe(true);
    expect(compiled.kind).toBe("md");
    expect((await docs.getCollection()).listDocuments()).resolves.toEqual([
      "docs/guide",
    ]);
  });

  it("prefers the request locale over the request-config locale for markdown helpers", async () => {
    await mkdir(join(rootDir, "en", "docs"), {
      recursive: true,
    });
    await mkdir(join(rootDir, "es", "docs"), {
      recursive: true,
    });
    await writeFile(
      join(rootDir, "en", "docs", "guide.md"),
      `---
title: Hello
---
# Hello
`,
    );
    await writeFile(
      join(rootDir, "es", "docs", "guide.md"),
      `---
title: Hola
---
# Hola
`,
    );

    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: {
        en,
        es,
      },
    });
    const docs = createMarkdownServerHelpers(
      async () => ({
        locale: "en" as const,
        translator,
      }),
      {
        rootDir,
      },
    );

    setRequestLocale("es");

    const document = await docs.getDocument("docs/guide");
    const explicitDocument = await docs.getDocument("docs/guide", {
      locale: "en",
    });

    expect(document.locale).toBe("es");
    expect(explicitDocument.locale).toBe("en");
  });

  it("rejects an unsupported stored request locale for markdown helpers", async () => {
    await mkdir(join(rootDir, "en", "docs"), {
      recursive: true,
    });
    await writeFile(
      join(rootDir, "en", "docs", "guide.md"),
      `---
title: Hello
---
# Hello
`,
    );

    const translator = await configureTranslations({
      availableLocales: ["en", "es"] as const,
      defaultLocale: "en",
      fallbackLocale: "en",
      messages: {
        en,
        es,
      },
    });
    const docs = createMarkdownServerHelpers(
      async () => ({
        translator,
      }),
      {
        rootDir,
      },
    );

    setRequestLocale("pt");

    await expect(docs.getDocument("docs/guide")).rejects.toThrow(
      'The locale "pt" is not included in the translator\'s supported locales.',
    );
  });
});
