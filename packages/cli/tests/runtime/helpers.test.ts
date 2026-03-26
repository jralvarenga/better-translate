import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import type { LanguageModelV3 } from "@ai-sdk/provider";

import { generateWithAiSdk } from "../../src/ai-sdk-generator.js";
import { runCli } from "../../src/cli.js";
import { defineConfig } from "../../src/define-config.js";
import { loadEnvFiles, loadEnvFilesFromDirectories } from "../../src/env.js";
import { createSpinnerLogger } from "../../src/logger.js";
import {
  applyMarkdownTranslation,
  createMarkdownOutputSchema,
  deriveTargetMarkdownPath,
  deriveTargetMarkdownRoot,
  listMarkdownSourceFiles,
  loadMarkdownDocument,
} from "../../src/markdown.js";
import { importModule } from "../../src/module-loader.js";
import {
  deriveTargetMessagesPath,
  loadSourceMessages,
  serializeMessages,
} from "../../src/messages.js";
import {
  createMarkdownPrompt,
  createMessagesPrompt,
} from "../../src/prompts.js";
import {
  assert,
  assertExactMessageShape,
  assertTranslationMessages,
  flattenTranslationKeys,
  isRecord,
  isTranslationMessages,
  normalizeMarkdownExtensions,
  toJavaScriptIdentifier,
} from "../../src/validation.js";

const tempDirectories: string[] = [];
const spinnerEvents: Array<{ type: string; value?: unknown }> = [];
const consoleMessages: string[] = [];
const originalNodeEnv = process.env.NODE_ENV;
const originalConsoleLog = console.log;
const testLanguageModel = {
  specificationVersion: "v3",
  provider: "openai",
  modelId: "gpt-5",
  supportedUrls: {},
  async doGenerate() {
    throw new Error("not implemented");
  },
  async doStream() {
    throw new Error("not implemented");
  },
} as LanguageModelV3;

mock.module("ora", () => ({
  default() {
    return {
      fail(message?: string) {
        spinnerEvents.push({
          type: "fail",
          value: message,
        });
      },
      start(message?: string) {
        spinnerEvents.push({
          type: "start",
          value: message,
        });
      },
      stop() {
        spinnerEvents.push({
          type: "stop",
        });
      },
      stopAndPersist(options?: unknown) {
        spinnerEvents.push({
          type: "stopAndPersist",
          value: options,
        });
      },
      succeed(message?: string) {
        spinnerEvents.push({
          type: "succeed",
          value: message,
        });
      },
    };
  },
}));

mock.module("picocolors", () => {
  const identity = (value: string) => value;
  const colors = {
    bold: identity,
    dim: identity,
    green: identity,
    magenta: identity,
    red: identity,
  };

  return {
    ...colors,
    default: colors,
  };
});

async function createWorkspace(): Promise<string> {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "better-translate-cli-helpers-"),
  );
  tempDirectories.push(directory);
  return directory;
}

beforeEach(() => {
  spinnerEvents.length = 0;
  consoleMessages.length = 0;
  console.log = ((message?: unknown) => {
    consoleMessages.push(String(message ?? ""));
  }) as typeof console.log;
});

afterEach(async () => {
  console.log = originalConsoleLog;
  process.env.NODE_ENV = originalNodeEnv;
  delete process.env.TEST_ENV_ORDER;
  delete process.env.TEST_SHARED_ENV;

  await Promise.all(
    tempDirectories.splice(0).map((directory) =>
      rm(directory, {
        force: true,
        recursive: true,
      }),
    ),
  );
});

describe("@better-translate/cli helpers", () => {
  it("loads env files in precedence order and deduplicates directory loads", async () => {
    process.env.NODE_ENV = "test";
    const workspace = await createWorkspace();
    const nested = path.join(workspace, "nested");

    await mkdir(nested, {
      recursive: true,
    });
    await writeFile(
      path.join(workspace, ".env"),
      "TEST_ENV_ORDER=base\n",
      "utf8",
    );
    await writeFile(
      path.join(workspace, ".env.local"),
      "TEST_ENV_ORDER=local\n",
      "utf8",
    );
    await writeFile(
      path.join(workspace, ".env.test"),
      "TEST_ENV_ORDER=test\nTEST_SHARED_ENV=workspace\n",
      "utf8",
    );
    await writeFile(
      path.join(workspace, ".env.test.local"),
      "TEST_ENV_ORDER=test-local\n",
      "utf8",
    );
    await writeFile(
      path.join(nested, ".env"),
      "TEST_SHARED_ENV=nested\n",
      "utf8",
    );

    expect(loadEnvFiles(workspace)).toEqual([
      path.join(workspace, ".env"),
      path.join(workspace, ".env.local"),
      path.join(workspace, ".env.test"),
      path.join(workspace, ".env.test.local"),
    ]);
    expect(process.env.TEST_ENV_ORDER).toBe("test-local");

    expect(loadEnvFilesFromDirectories([workspace, nested, workspace])).toEqual(
      [
        path.join(workspace, ".env"),
        path.join(workspace, ".env.local"),
        path.join(workspace, ".env.test"),
        path.join(workspace, ".env.test.local"),
        path.join(nested, ".env"),
      ],
    );
    expect(process.env.TEST_SHARED_ENV).toBe("workspace");
  });

  it("validates shapes, keys, extensions, and identifiers", () => {
    expect(isRecord({ ok: true })).toBe(true);
    expect(isRecord(null)).toBe(false);
    expect(isTranslationMessages({ home: { title: "Hello" } })).toBe(true);
    expect(isTranslationMessages({ home: { title: 1 } })).toBe(false);
    expect(
      flattenTranslationKeys({ home: { title: "Hello", body: "World" } }),
    ).toEqual(["home.title", "home.body"]);
    expect(normalizeMarkdownExtensions(undefined)).toEqual([".md", ".mdx"]);
    expect(normalizeMarkdownExtensions([".md", ".mdx", ".md"])).toEqual([
      ".md",
      ".mdx",
    ]);
    expect(toJavaScriptIdentifier("pt-BR messages")).toBe("ptBrMessages");
    expect(toJavaScriptIdentifier("123 locale")).toBe("_123Locale");
    expect(toJavaScriptIdentifier("!!!")).toBe("messages");

    expect(() => assert(false, "nope")).toThrow("nope");
    expect(() =>
      assertTranslationMessages(
        {
          bad: 1,
        },
        "bad shape",
      ),
    ).toThrow("bad shape");
    expect(() =>
      assertExactMessageShape(
        {
          home: {
            title: "Hello",
          },
        },
        {
          home: {
            subtitle: "Hola",
          },
        },
      ),
    ).toThrow('Generated translations are missing the key "home.title".');
    expect(() => normalizeMarkdownExtensions([])).toThrow(
      "markdown.extensions must include at least one extension.",
    );
    expect(() => normalizeMarkdownExtensions([".txt"])).toThrow(
      'markdown.extensions only supports ".md" and ".mdx".',
    );
  });

  it("loads source messages from JSON and TypeScript modules", async () => {
    const workspace = await createWorkspace();
    const jsonPath = path.join(workspace, "messages", "en.json");
    const tsPath = path.join(workspace, "messages", "en.ts");

    await mkdir(path.dirname(jsonPath), {
      recursive: true,
    });
    await writeFile(
      jsonPath,
      JSON.stringify(
        {
          home: {
            title: "Hello",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      tsPath,
      `export const en = {
  home: {
    title: "Hello",
  },
} as const;
`,
      "utf8",
    );
    await writeFile(
      path.join(workspace, "messages", "en.md"),
      "# Hello\n",
      "utf8",
    );

    await expect(loadSourceMessages(jsonPath, "en")).resolves.toMatchObject({
      format: "json",
      keyPaths: ["home.title"],
      sourcePath: jsonPath,
    });
    await expect(loadSourceMessages(tsPath, "en")).resolves.toMatchObject({
      format: "ts",
      keyPaths: ["home.title"],
      sourcePath: tsPath,
    });
    await expect(
      loadSourceMessages(path.join(workspace, "messages", "en.md"), "en"),
    ).rejects.toThrow(
      'Unsupported source translation extension ".md". Use .json or .ts.',
    );
  });

  it("derives target message paths, serializes output, and imports modules", async () => {
    const workspace = await createWorkspace();
    const jsModulePath = path.join(workspace, "module.js");
    const tsModulePath = path.join(workspace, "module.ts");

    await writeFile(jsModulePath, "export default { value: 1 };\n", "utf8");
    await writeFile(
      tsModulePath,
      `export const config = { value: 2 } as const;
export default config;
`,
      "utf8",
    );

    expect(
      deriveTargetMessagesPath(
        path.join(workspace, "messages", "en.json"),
        "en",
        "es",
      ),
    ).toBe(path.join(workspace, "messages", "es.json"));
    expect(() =>
      deriveTargetMessagesPath(
        path.join(workspace, "messages", "messages.json"),
        "en",
        "es",
      ),
    ).toThrow(
      `Could not derive a target messages filename from "${path.join(workspace, "messages", "messages.json")}". The basename must contain the source locale "en".`,
    );
    expect(
      serializeMessages(
        {
          home: {
            title: "Hola",
          },
        },
        "json",
        "es",
      ),
    ).toContain('"title": "Hola"');
    expect(
      serializeMessages(
        {
          greeting: "Hola",
        },
        "ts",
        "pt-BR",
      ),
    ).toContain("export const ptBr");
    expect(
      serializeMessages(
        {
          greeting: "Hola",
          nested: {
            home: "Inicio",
          },
        },
        "ts",
        "pt-BR",
      ),
    ).toContain('greeting: "Hola"');
    expect(
      serializeMessages(
        {
          greeting: "Hola",
        },
        "ts",
        "pt-BR",
      ),
    ).not.toContain('"greeting": "Hola"');

    expect(await importModule(jsModulePath)).toEqual({
      default: {
        value: 1,
      },
    });
    expect(await importModule(tsModulePath)).toEqual({
      config: {
        value: 2,
      },
      default: {
        value: 2,
      },
    });
  });

  it("loads and transforms markdown helper inputs", async () => {
    const workspace = await createWorkspace();
    const rootDir = path.join(workspace, "docs", "en");
    const sourcePath = path.join(rootDir, "guides", "intro.mdx");

    await mkdir(path.dirname(sourcePath), {
      recursive: true,
    });
    await writeFile(
      sourcePath,
      `---
title: Intro
meta:
  summary: Summary
count: 1
---

# Welcome

<Callout>Docs</Callout>
`,
      "utf8",
    );

    expect(createMarkdownOutputSchema({ title: "Intro" })).toEqual({
      additionalProperties: false,
      properties: {
        body: {
          type: "string",
        },
        frontmatter: {
          additionalProperties: false,
          properties: {
            title: {
              type: "string",
            },
          },
          required: ["title"],
          type: "object",
        },
      },
      required: ["body", "frontmatter"],
      type: "object",
    });
    await expect(
      listMarkdownSourceFiles(path.join(workspace, "docs"), [".md", ".mdx"]),
    ).resolves.toEqual([sourcePath]);

    const document = await loadMarkdownDocument(rootDir, sourcePath);

    expect(document.relativePath).toBe("guides/intro.mdx");
    expect(document.frontmatter).toEqual({
      count: 1,
      meta: {
        summary: "Summary",
      },
      title: "Intro",
    });
    expect(document.frontmatterStrings).toEqual({
      meta: {
        summary: "Summary",
      },
      title: "Intro",
    });
    expect(
      applyMarkdownTranslation(
        document.frontmatter,
        {
          meta: {
            summary: "Resumen",
          },
          title: "Introduccion",
        },
        "# Bienvenido\n",
      ),
    ).toContain("title: Introduccion");
    expect(deriveTargetMarkdownRoot(rootDir, "en", "es")).toBe(
      path.join(workspace, "docs", "es"),
    );
    expect(
      deriveTargetMarkdownPath(rootDir, "en", "es", "guides/intro.mdx"),
    ).toBe(path.join(workspace, "docs", "es", "guides/intro.mdx"));
    expect(() =>
      deriveTargetMarkdownRoot(path.join(workspace, "docs"), "en", "es"),
    ).toThrow(
      'markdown.rootDir must end with the source locale "en" so the CLI can mirror sibling locale folders.',
    );
  });

  it("builds config helpers and prompt text", () => {
    expect(
      defineConfig({
        gateway: {
          apiKey: "key",
        },
        locales: ["es"],
        messages: {
          entry: "./messages/en.json",
        },
        model: "openai/gpt-4.1",
        sourceLocale: "en",
      }),
    ).toEqual({
      gateway: {
        apiKey: "key",
      },
      locales: ["es"],
      messages: {
        entry: "./messages/en.json",
      },
      model: "openai/gpt-4.1",
      sourceLocale: "en",
    });
    expect(
      defineConfig({
        locales: ["es"],
        messages: {
          entry: "./messages/en.json",
        },
        model: testLanguageModel,
        sourceLocale: "en",
      }),
    ).toEqual({
      locales: ["es"],
      messages: {
        entry: "./messages/en.json",
      },
      model: testLanguageModel,
      sourceLocale: "en",
    });

    const messagesPrompt = createMessagesPrompt({
      keyPaths: ["home.title"],
      sourceLocale: "en",
      sourceMessages: {
        home: {
          title: "Hello",
        },
      },
      sourcePath: "/messages/en.json",
      sourceText: '{ "home": { "title": "Hello" } }',
      targetLocale: "es",
    });
    const markdownPrompt = createMarkdownPrompt({
      body: "# Hello",
      frontmatterStrings: {
        title: "Intro",
      },
      relativePath: "guides/intro.md",
      sourceLocale: "en",
      sourceText: "---\ntitle: Intro\n---\n# Hello\n",
      targetLocale: "es",
    });

    expect(messagesPrompt.prompt).toContain(
      'Translate the source locale file into "es".',
    );
    expect(messagesPrompt.prompt).toContain("- home.title");
    expect(markdownPrompt.prompt).toContain(
      'Translate this markdown document into "es".',
    );
    expect(markdownPrompt.prompt).toContain('"title": "Intro"');
  });

  it("does not export the removed openai config helper", async () => {
    const configModule = await import("../../src/config.js");

    expect("openai" in configModule).toBe(false);
  });

  it("maps AI SDK generation requests and logger output", async () => {
    let generateTextInput: Record<string, unknown> | undefined;

    mock.module("ai", () => ({
      Output: {
        object(value: unknown) {
          return value;
        },
      },
      async generateText(input: Record<string, unknown>) {
        generateTextInput = input;
        return {
          experimental_output: {
            greeting: "Hola",
          },
        };
      },
      jsonSchema(schema: unknown, options: Record<string, unknown>) {
        return {
          options,
          schema,
        };
      },
    }));

    const generated = await generateWithAiSdk(
      {
        id: "model",
      },
      {
        kind: "messages",
        prompt: "prompt",
        schema: {
          type: "object",
        },
        sourcePath: "/messages/en.json",
        system: "system",
        targetLocale: "es",
        validate(value: unknown) {
          assert(
            isRecord(value) && value.greeting === "Hola",
            "invalid generated value",
          );
          return value as {
            greeting: string;
          };
        },
      },
    );

    expect(generated).toEqual({
      greeting: "Hola",
    });
    expect(generateTextInput).toMatchObject({
      model: {
        id: "model",
      },
      prompt: "prompt",
      system: "system",
      temperature: 0,
    });

    const logger = createSpinnerLogger();
    logger.info("Loading Better Translate config...");
    logger.info('Starting locale "es"...');
    logger.info('Requesting message translation for "es"...');
    logger.info("wrote messages:es /tmp/project/messages/es.json");
    logger.info("[dry-run] messages:es /tmp/project/messages/es.json");
    logger.error("boom");

    expect(spinnerEvents.map((event) => event.type)).toEqual([
      "start",
      "stop",
      "start",
      "succeed",
      "stopAndPersist",
      "fail",
    ]);
  });

  it("falls back to plain JSON when structured output grammar is too large", async () => {
    const generateTextInputs: Record<string, unknown>[] = [];

    mock.module("ai", () => ({
      Output: {
        object(value: unknown) {
          return value;
        },
      },
      async generateText(input: Record<string, unknown>) {
        generateTextInputs.push(input);

        if (generateTextInputs.length === 1) {
          throw new Error(
            "The compiled grammar is too large, which would cause performance issues. Simplify your tool schemas or reduce the number of strict tools.",
          );
        }

        return {
          text: '{"greeting":"Hola"}',
        };
      },
      jsonSchema(schema: unknown, options: Record<string, unknown>) {
        return {
          options,
          schema,
        };
      },
    }));

    const generated = await generateWithAiSdk(
      {
        id: "model",
      },
      {
        kind: "messages",
        prompt: "prompt",
        schema: {
          type: "object",
        },
        sourcePath: "/messages/en.json",
        system: "system",
        targetLocale: "es",
        validate(value: unknown) {
          assert(
            isRecord(value) && value.greeting === "Hola",
            "invalid generated value",
          );
          return value as {
            greeting: string;
          };
        },
      },
    );

    expect(generated).toEqual({
      greeting: "Hola",
    });
    expect(generateTextInputs).toHaveLength(2);
    expect(generateTextInputs[0]).toHaveProperty("experimental_output");
    expect(generateTextInputs[1]).not.toHaveProperty("experimental_output");
    expect(generateTextInputs[1]?.system).toContain("Return only valid JSON.");
    expect(generateTextInputs[1]?.prompt).toContain(
      "Do not wrap the JSON in markdown fences.",
    );
  });

  it("parses fenced JSON from the plain-text fallback", async () => {
    mock.module("ai", () => ({
      Output: {
        object(value: unknown) {
          return value;
        },
      },
      async generateText(input: Record<string, unknown>) {
        if ("experimental_output" in input) {
          throw new Error("simplify your tool schemas");
        }

        return {
          text: '```json\n{"greeting":"Hola"}\n```',
        };
      },
      jsonSchema(schema: unknown, options: Record<string, unknown>) {
        return {
          options,
          schema,
        };
      },
    }));

    const generated = await generateWithAiSdk(
      {
        id: "model",
      },
      {
        kind: "messages",
        prompt: "prompt",
        schema: {
          type: "object",
        },
        sourcePath: "/messages/en.json",
        system: "system",
        targetLocale: "es",
        validate(value: unknown) {
          assert(
            isRecord(value) && value.greeting === "Hola",
            "invalid generated value",
          );
          return value as {
            greeting: string;
          };
        },
      },
    );

    expect(generated).toEqual({
      greeting: "Hola",
    });
  });

  it("handles CLI help and argument errors", async () => {
    const stdout: string[] = [];
    const stderr: string[] = [];

    expect(
      await runCli([], {
        stderr(message) {
          stderr.push(message);
        },
        stdout(message) {
          stdout.push(message);
        },
      }),
    ).toBe(1);
    expect(stdout[0]).toContain("Usage:");

    expect(
      await runCli(["--help"], {
        stderr(message) {
          stderr.push(message);
        },
        stdout(message) {
          stdout.push(message);
        },
      }),
    ).toBe(0);

    expect(
      await runCli(["unknown"], {
        stderr(message) {
          stderr.push(message);
        },
      }),
    ).toBe(1);
    expect(
      await runCli(["generate", "--config"], {
        stderr(message) {
          stderr.push(message);
        },
      }),
    ).toBe(1);
    expect(
      await runCli(["extract", "--config"], {
        stderr(message) {
          stderr.push(message);
        },
      }),
    ).toBe(1);
    expect(
      stderr.some((message) => message.includes('Unknown command "unknown".')),
    ).toBe(true);
    expect(
      stderr.some((message) =>
        message.includes(
          "Better Translate generate failed: --config requires a file path.",
        ),
      ),
    ).toBe(true);
    expect(
      stderr.some((message) =>
        message.includes(
          "Better Translate extract failed: --config requires a file path.",
        ),
      ),
    ).toBe(true);
  });
});
