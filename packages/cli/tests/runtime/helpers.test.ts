import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PassThrough, Writable } from "node:stream";

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import type { LanguageModelV3 } from "@ai-sdk/provider";

import { generateWithAiSdk } from "../../src/ai-sdk-generator.js";
import { runCli } from "../../src/cli.js";
import { confirmMarkdownWrites, confirmPurgeKey } from "../../src/confirm.js";
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
  validateMarkdownTranslation,
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
} satisfies LanguageModelV3;

class FakeTtyInput extends PassThrough {
  isRaw = false;
  isTTY = true;
  paused = true;

  setRawMode(value: boolean) {
    this.isRaw = value;
    return this;
  }

  isPaused() {
    return this.paused;
  }

  pause() {
    this.paused = true;
    return super.pause();
  }

  resume() {
    this.paused = false;
    return super.resume();
  }
}

class FakeTtyOutput extends Writable {
  isTTY = true;
  chunks: string[] = [];

  _write(
    chunk: string | Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ) {
    this.chunks.push(String(chunk));
    callback();
  }

  toString() {
    return this.chunks.join("");
  }
}

function emitKey(input: FakeTtyInput, value: string, name: string): void {
  input.emit("keypress", value, {
    ctrl: false,
    meta: false,
    name,
    sequence: value,
    shift: false,
  });
}

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
    expect(messagesPrompt.prompt).toContain("Do not output reasoning");
    expect(messagesPrompt.system).toContain("Never include reasoning");
    expect(messagesPrompt.system).toContain("<think> tags");
    expect(markdownPrompt.prompt).toContain(
      'Translate this markdown document into "es".',
    );
    expect(markdownPrompt.prompt).toContain('"title": "Intro"');
    expect(markdownPrompt.prompt).toContain("Do not output reasoning");
    expect(markdownPrompt.prompt).toContain("Required JSON response shape:");
    expect(markdownPrompt.prompt).toContain(
      '"body": "<translated markdown or mdx body as one string>"',
    );
    expect(markdownPrompt.prompt).toContain(
      "Do not move frontmatter fields to the top level.",
    );
    expect(markdownPrompt.prompt).toContain(
      "preserve markdown/code fences plus existing HTML/JSX/MDX tags and do not add any text before or after the requested data.",
    );
    expect(markdownPrompt.system).toContain("never include reasoning");
  });

  it("normalizes common markdown output aliases", () => {
    expect(
      validateMarkdownTranslation(
        {
          title: "Intro",
        },
        {
          content: "# Hola\n",
          frontMatter: {
            title: "Introduccion",
          },
        },
      ),
    ).toEqual({
      body: "# Hola\n",
      frontmatter: {
        title: "Introduccion",
      },
    });

    expect(
      validateMarkdownTranslation(
        {
          title: "Intro",
        },
        {
          body: "# Hola\n",
          title: "Introduccion",
        },
      ),
    ).toEqual({
      body: "# Hola\n",
      frontmatter: {
        title: "Introduccion",
      },
    });

    expect(
      validateMarkdownTranslation(
        {
          title: "Intro",
        },
        {
          document: "# Hola\n",
          metadata: {
            title: "Introduccion",
          },
        },
      ),
    ).toEqual({
      body: "# Hola\n",
      frontmatter: {
        title: "Introduccion",
      },
    });

    expect(
      validateMarkdownTranslation(
        {
          title: "Intro",
        },
        {
          result: {
            output: {
              data: {
                document: "# Hola\n",
                meta: {
                  title: "Introduccion",
                },
              },
            },
          },
        },
      ),
    ).toEqual({
      body: "# Hola\n",
      frontmatter: {
        title: "Introduccion",
      },
    });
  });

  it("does not export provider helpers from the config module", async () => {
    const configModule = await import("../../src/config.js");

    expect("openai" in configModule).toBe(false);
    expect("ollama" in configModule).toBe(false);
    expect("createOllama" in configModule).toBe(false);
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
        providerOptions: {
          ollama: {
            think: true,
          },
        },
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
      providerOptions: {
        ollama: {
          think: true,
        },
      },
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
        providerOptions: {
          ollama: {
            think: true,
          },
        },
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
    expect(generateTextInputs[0]?.providerOptions).toEqual({
      ollama: {
        think: true,
      },
    });
    expect(generateTextInputs[1]?.providerOptions).toEqual({
      ollama: {
        think: true,
      },
    });
    expect(generateTextInputs[1]?.system).toContain("Return only valid JSON.");
    expect(generateTextInputs[1]?.system).toContain("Never include reasoning");
    expect(generateTextInputs[1]?.prompt).toContain(
      "Do not wrap the JSON in markdown fences.",
    );
    expect(generateTextInputs[1]?.prompt).toContain(
      "Start with { and end with }.",
    );
    expect(generateTextInputs[1]?.prompt).toContain("Do not include reasoning");
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
          throw new Error(
            "The compiled grammar is too large, which would cause performance issues. Simplify your tool schemas or reduce the number of strict tools.",
          );
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

  it("falls back to plain JSON when structured output cannot be parsed", async () => {
    const generateTextInputs: Record<string, unknown>[] = [];

    mock.module("ai", () => ({
      Output: {
        object(value: unknown) {
          return value;
        },
      },
      async generateText(input: Record<string, unknown>) {
        generateTextInputs.push(input);

        if ("experimental_output" in input) {
          throw new Error("No object generated: could not parse the response.");
        }

        return {
          text: '<think>Need to reason first</think>\n{"greeting":"Hola"}',
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
    expect(generateTextInputs[1]).not.toHaveProperty("experimental_output");
  });

  it("preserves <think> tags inside JSON string fields", async () => {
    mock.module("ai", () => ({
      Output: {
        object(value: unknown) {
          return value;
        },
      },
      async generateText(input: Record<string, unknown>) {
        if ("experimental_output" in input) {
          throw new Error("No object generated: could not parse the response.");
        }

        return {
          text: '<think>Reason first</think>\n{"greeting":"Use <think>literal</think> tags"}',
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
            isRecord(value) &&
              value.greeting === "Use <think>literal</think> tags",
            "invalid generated value",
          );
          return value as {
            greeting: string;
          };
        },
      },
    );

    expect(generated).toEqual({
      greeting: "Use <think>literal</think> tags",
    });
  });

  it("parses Ollama plain JSON without a validator when the response is valid JSON", async () => {
    mock.module("ai", () => ({
      Output: {
        object(value: unknown) {
          return value;
        },
      },
      async generateText() {
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
        modelId: "qwen3:4b",
        provider: "ollama.responses",
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
      },
    );

    expect(generated).toEqual({
      greeting: "Hola",
    });
  });

  it("prefers plain JSON for Ollama provider models", async () => {
    const generateTextInputs: Record<string, unknown>[] = [];

    mock.module("ai", () => ({
      Output: {
        object(value: unknown) {
          return value;
        },
      },
      async generateText(input: Record<string, unknown>) {
        generateTextInputs.push(input);

        return {
          text: '<think>Translate carefully</think>\n{"content":"# Hola\\n","frontMatter":{"title":"Introduccion"}}',
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
        modelId: "qwen3:4b",
        provider: "ollama.responses",
      },
      {
        kind: "markdown",
        prompt: "prompt",
        schema: {
          type: "object",
        },
        sourcePath: "/docs/en/intro.mdx",
        system: "system",
        targetLocale: "es",
        validate(value: unknown) {
          return validateMarkdownTranslation(
            {
              title: "Intro",
            },
            value,
          );
        },
      },
    );

    expect(generated).toEqual({
      body: "# Hola\n",
      frontmatter: {
        title: "Introduccion",
      },
    });
    expect(generateTextInputs).toHaveLength(1);
    expect(generateTextInputs[0]).not.toHaveProperty("experimental_output");
    expect(generateTextInputs[0]?.system).toContain("Return only valid JSON.");
    expect(generateTextInputs[0]?.system).toContain("Never include reasoning");
    expect(generateTextInputs[0]?.prompt).toContain(
      "Do not wrap the JSON in markdown fences.",
    );
    expect(generateTextInputs[0]?.prompt).toContain(
      "Start with { and end with }.",
    );
    expect(generateTextInputs[0]?.prompt).toContain("Do not include reasoning");
    expect(generateTextInputs[0]?.prompt).toContain(
      'For markdown, return exactly an object with "body" and "frontmatter" keys.',
    );
    expect(generateTextInputs[0]?.prompt).toContain(
      "Do not rename body to content, markdown, mdx, or document.",
    );
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
    expect(stdout[0]).toContain("[--yes|-y]");
    expect(stdout[0]).toContain("bt purge");

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
      await runCli(["purge", "--config"], {
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
    expect(
      stderr.some((message) =>
        message.includes(
          "Better Translate purge failed: --config requires a file path.",
        ),
      ),
    ).toBe(true);
  });

  it("passes --yes through generate and purge", async () => {
    const generateCalls: Array<Record<string, unknown>> = [];
    const purgeCalls: Array<Record<string, unknown>> = [];

    expect(
      await runCli(["generate", "--yes"], {
        async generateProjectImpl(options) {
          generateCalls.push(options as Record<string, unknown>);
          return {
            dryRun: false,
            loadedConfig: null as never,
            writes: [],
          };
        },
        stderr() {},
        stdout() {},
      }),
    ).toBe(0);

    expect(
      await runCli(["generate", "-y"], {
        async generateProjectImpl(options) {
          generateCalls.push(options as Record<string, unknown>);
          return {
            dryRun: false,
            loadedConfig: null as never,
            writes: [],
          };
        },
        stderr() {},
        stdout() {},
      }),
    ).toBe(0);

    expect(
      await runCli(["purge", "--yes"], {
        async purgeProjectImpl(options) {
          purgeCalls.push(options as Record<string, unknown>);
          return {
            dryRun: false,
            keptKeys: [],
            loadedConfig: null as never,
            localeChanges: [],
            localeFiles: [],
            protectedKeys: [],
            purgedKeys: [],
            unsafeKeys: [],
            unusedKeys: [],
            warnings: [],
          };
        },
        stderr() {},
        stdout() {},
      }),
    ).toBe(0);

    expect(
      await runCli(["purge", "-y"], {
        async purgeProjectImpl(options) {
          purgeCalls.push(options as Record<string, unknown>);
          return {
            dryRun: false,
            keptKeys: [],
            loadedConfig: null as never,
            localeChanges: [],
            localeFiles: [],
            protectedKeys: [],
            purgedKeys: [],
            unsafeKeys: [],
            unusedKeys: [],
            warnings: [],
          };
        },
        stderr() {},
        stdout() {},
      }),
    ).toBe(0);

    expect(generateCalls).toHaveLength(2);
    expect(purgeCalls).toHaveLength(2);
    expect(generateCalls[0]?.yes).toBe(true);
    expect(generateCalls[1]?.yes).toBe(true);
    expect(purgeCalls[0]?.yes).toBe(true);
    expect(purgeCalls[1]?.yes).toBe(true);
  });

  it("confirms prompts on single keypress without requiring enter", async () => {
    const purgeInput = new FakeTtyInput();
    const purgeOutput = new FakeTtyOutput();
    const purgePromise = confirmPurgeKey(
      {
        key: "sidebar.nav.legacy",
      },
      {
        input: purgeInput as never,
        output: purgeOutput as never,
      },
    );

    emitKey(purgeInput, "y", "y");

    await expect(purgePromise).resolves.toBe(true);
    expect(purgeOutput.toString()).toContain(
      '? Purge unused key "sidebar.nav.legacy"? (y/N) y',
    );
    expect(purgeInput.paused).toBe(true);

    const markdownInput = new FakeTtyInput();
    const markdownOutput = new FakeTtyOutput();
    const markdownPromise = confirmMarkdownWrites(
      {
        createCount: 1,
        overwriteCount: 0,
        projectCwd: "/tmp/project",
        writes: [
          {
            action: "create",
            locale: "es",
            sourcePath: "/tmp/project/docs/en/intro.mdx",
            targetPath: "/tmp/project/docs/es/intro.mdx",
          },
        ],
      },
      {
        input: markdownInput as never,
        output: markdownOutput as never,
      },
    );

    emitKey(markdownInput, "n", "n");

    await expect(markdownPromise).resolves.toBe(false);
    expect(markdownOutput.toString()).toContain("Continue? [y/N] n");
    expect(markdownInput.paused).toBe(true);
  });

  it("still treats enter as the default no response", async () => {
    const input = new FakeTtyInput();
    const output = new FakeTtyOutput();
    const confirmation = confirmPurgeKey(
      {
        key: "home.old",
      },
      {
        input: input as never,
        output: output as never,
      },
    );

    emitKey(input, "\r", "return");

    await expect(confirmation).resolves.toBe(false);
    expect(output.toString()).toContain(
      '? Purge unused key "home.old"? (y/N) ',
    );
  });

  it("ignores non-character keypresses without crashing the prompt", async () => {
    const input = new FakeTtyInput();
    const output = new FakeTtyOutput();
    const confirmation = confirmPurgeKey(
      {
        key: "home.old",
      },
      {
        input: input as never,
        output: output as never,
      },
    );

    input.emit("keypress", undefined, {
      ctrl: false,
      meta: false,
      name: "left",
      sequence: "",
      shift: false,
    });

    const pendingState = await Promise.race([
      confirmation.then(() => "resolved"),
      new Promise<string>((resolve) => {
        setTimeout(() => resolve("pending"), 20);
      }),
    ]);

    expect(pendingState).toBe("pending");

    emitKey(input, "n", "n");
    await expect(confirmation).resolves.toBe(false);
  });

  it("ignores repeated confirmation keys inside the debounce window", async () => {
    const input = new FakeTtyInput();
    const output = new FakeTtyOutput();
    const firstConfirmation = confirmPurgeKey(
      {
        key: "unusedA",
      },
      {
        input: input as never,
        output: output as never,
      },
    );

    emitKey(input, "y", "y");
    await expect(firstConfirmation).resolves.toBe(true);

    const secondConfirmation = confirmPurgeKey(
      {
        key: "unusedB",
      },
      {
        input: input as never,
        output: output as never,
      },
    );

    const pendingState = await Promise.race([
      secondConfirmation.then(() => "resolved"),
      new Promise<string>((resolve) => {
        setTimeout(() => resolve("pending"), 20);
      }),
    ]);

    expect(pendingState).toBe("pending");

    emitKey(input, "y", "y");

    const stillPendingState = await Promise.race([
      secondConfirmation.then(() => "resolved"),
      new Promise<string>((resolve) => {
        setTimeout(() => resolve("pending"), 20);
      }),
    ]);

    expect(stillPendingState).toBe("pending");

    emitKey(input, "n", "n");

    await expect(secondConfirmation).resolves.toBe(false);
  });

  it("accepts the same confirmation key again after the debounce window", async () => {
    const input = new FakeTtyInput();
    const output = new FakeTtyOutput();
    const firstConfirmation = confirmPurgeKey(
      {
        key: "unusedA",
      },
      {
        input: input as never,
        output: output as never,
      },
    );

    emitKey(input, "y", "y");
    await expect(firstConfirmation).resolves.toBe(true);

    const secondConfirmation = confirmPurgeKey(
      {
        key: "unusedB",
      },
      {
        input: input as never,
        output: output as never,
      },
    );

    await new Promise((resolve) => {
      setTimeout(resolve, 800);
    });

    emitKey(input, "y", "y");

    await expect(secondConfirmation).resolves.toBe(true);
  });

  it("extends the debounce window while repeated identical key events continue", async () => {
    const originalDateNow = Date.now;
    let now = 0;
    Date.now = () => now;

    try {
      const input = new FakeTtyInput();
      const output = new FakeTtyOutput();
      const firstConfirmation = confirmPurgeKey(
        {
          key: "unusedA",
        },
        {
          input: input as never,
          output: output as never,
        },
      );

      emitKey(input, "y", "y");
      await expect(firstConfirmation).resolves.toBe(true);

      const secondConfirmation = confirmPurgeKey(
        {
          key: "unusedB",
        },
        {
          input: input as never,
          output: output as never,
        },
      );

      now = 700;
      emitKey(input, "y", "y");

      now = 1400;
      emitKey(input, "y", "y");

      const pendingState = await Promise.race([
        secondConfirmation.then(() => "resolved"),
        new Promise<string>((resolve) => {
          setTimeout(() => resolve("pending"), 20);
        }),
      ]);

      expect(pendingState).toBe("pending");

      now = 2200;
      emitKey(input, "y", "y");

      await expect(secondConfirmation).resolves.toBe(true);
    } finally {
      Date.now = originalDateNow;
    }
  });
});
