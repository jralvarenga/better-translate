import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

import type { TranslationMessages } from "@better-translate/core";

import type { MarkdownExtension } from "./types.js";
import { assert, assertExactMessageShape, isRecord } from "./validation.js";

export interface LoadedMarkdownDocument {
  body: string;
  frontmatter: Record<string, unknown>;
  frontmatterStrings: TranslationMessages;
  relativePath: string;
  schema: object;
  sourceText: string;
  sourcePath: string;
}

export interface ValidatedMarkdownTranslation {
  body: string;
  frontmatter: TranslationMessages;
}

async function walkDirectory(directory: string): Promise<string[]> {
  const entries = await readdir(directory, {
    withFileTypes: true,
  });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return walkDirectory(entryPath);
      }

      if (entry.isFile()) {
        return [entryPath];
      }

      return [];
    }),
  );

  return files.flat();
}

function extractFrontmatterStrings(value: unknown): TranslationMessages {
  if (!isRecord(value)) {
    return {};
  }

  const result: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") {
      result[key] = entry;
      continue;
    }

    if (isRecord(entry)) {
      const nested = extractFrontmatterStrings(entry);

      if (Object.keys(nested).length > 0) {
        result[key] = nested;
      }
    }
  }

  return result as TranslationMessages;
}

function createStringOnlySchema(value: TranslationMessages): object {
  const properties: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(value)) {
    properties[key] =
      typeof entry === "string"
        ? { type: "string" }
        : createStringOnlySchema(entry as TranslationMessages);
  }

  return {
    additionalProperties: false,
    properties,
    required: Object.keys(value),
    type: "object",
  };
}

export function createMarkdownOutputSchema(
  frontmatterStrings: TranslationMessages,
): object {
  return {
    additionalProperties: false,
    properties: {
      body: {
        type: "string",
      },
      frontmatter: createStringOnlySchema(frontmatterStrings),
    },
    required: ["body", "frontmatter"],
    type: "object",
  };
}

function getFirstStringProperty(
  value: Record<string, unknown>,
  keys: readonly string[],
): string | undefined {
  for (const key of keys) {
    const candidate = value[key];

    if (typeof candidate === "string") {
      return candidate;
    }
  }

  return undefined;
}

function getFirstRecordProperty(
  value: Record<string, unknown>,
  keys: readonly string[],
): Record<string, unknown> | undefined {
  for (const key of keys) {
    const candidate = value[key];

    if (isRecord(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

function pickTranslationShape(
  reference: TranslationMessages,
  candidate: Record<string, unknown>,
): TranslationMessages | undefined {
  const result: Record<string, unknown> = {};

  for (const [key, referenceValue] of Object.entries(reference)) {
    if (!(key in candidate)) {
      return undefined;
    }

    const candidateValue = candidate[key];

    if (typeof referenceValue === "string") {
      if (typeof candidateValue !== "string") {
        return undefined;
      }

      result[key] = candidateValue;
      continue;
    }

    if (!isRecord(candidateValue)) {
      return undefined;
    }

    const nested = pickTranslationShape(
      referenceValue as TranslationMessages,
      candidateValue,
    );

    if (!nested) {
      return undefined;
    }

    result[key] = nested;
  }

  return result as TranslationMessages;
}

function unwrapMarkdownCandidate(
  value: unknown,
): Record<string, unknown> | undefined {
  let candidate = value;

  for (let depth = 0; depth < 5; depth += 1) {
    if (!isRecord(candidate)) {
      return undefined;
    }

    if (
      typeof candidate.body === "string" ||
      typeof candidate.markdown === "string" ||
      typeof candidate.content === "string" ||
      typeof candidate.mdx === "string" ||
      typeof candidate.document === "string" ||
      isRecord(candidate.frontmatter) ||
      isRecord(candidate.frontMatter)
    ) {
      return candidate;
    }

    const nextCandidate = getFirstRecordProperty(candidate, [
      "result",
      "translation",
      "output",
      "data",
      "document",
    ]);

    if (!nextCandidate) {
      return undefined;
    }

    candidate = nextCandidate;
  }

  return undefined;
}

export function validateMarkdownTranslation(
  frontmatterStrings: TranslationMessages,
  value: unknown,
): ValidatedMarkdownTranslation {
  const candidate = unwrapMarkdownCandidate(value);

  assert(
    candidate,
    "Generated markdown output must be an object with body and frontmatter.",
  );

  const body = getFirstStringProperty(candidate, [
    "body",
    "markdown",
    "content",
    "mdx",
    "document",
  ]);

  assert(
    typeof body === "string",
    "Generated markdown output must include a string body.",
  );

  const frontmatter =
    getFirstRecordProperty(candidate, [
      "frontmatter",
      "frontMatter",
      "metadata",
      "meta",
    ]) ??
    (Object.keys(frontmatterStrings).length === 0
      ? {}
      : pickTranslationShape(frontmatterStrings, candidate));

  assert(
    isRecord(frontmatter),
    "Generated markdown output must include a frontmatter object.",
  );

  assertExactMessageShape(frontmatterStrings, frontmatter);

  return {
    body,
    frontmatter: frontmatter as TranslationMessages,
  };
}

function mergeFrontmatterStrings(
  source: Record<string, unknown>,
  translatedStrings: TranslationMessages,
): Record<string, unknown> {
  const merged: Record<string, unknown> = {
    ...source,
  };

  for (const [key, entry] of Object.entries(translatedStrings)) {
    if (typeof entry === "string") {
      merged[key] = entry;
      continue;
    }

    const nestedSource = isRecord(source[key])
      ? (source[key] as Record<string, unknown>)
      : {};

    merged[key] = mergeFrontmatterStrings(
      nestedSource,
      entry as TranslationMessages,
    );
  }

  return merged;
}

export function applyMarkdownTranslation(
  sourceFrontmatter: Record<string, unknown>,
  translatedStrings: TranslationMessages,
  body: string,
): string {
  return matter.stringify(
    body,
    mergeFrontmatterStrings(sourceFrontmatter, translatedStrings),
  );
}

export async function listMarkdownSourceFiles(
  rootDir: string,
  extensions: readonly MarkdownExtension[],
): Promise<string[]> {
  const files = await walkDirectory(rootDir);

  return files
    .filter((filePath) =>
      extensions.some((extension) => filePath.endsWith(extension)),
    )
    .sort();
}

export async function loadMarkdownDocument(
  rootDir: string,
  sourcePath: string,
): Promise<LoadedMarkdownDocument> {
  const sourceText = await readFile(sourcePath, "utf8");
  const parsed = matter(sourceText);
  const frontmatter = isRecord(parsed.data) ? parsed.data : {};
  const frontmatterStrings = extractFrontmatterStrings(frontmatter);
  const relativePath = path
    .relative(rootDir, sourcePath)
    .split(path.sep)
    .join("/");

  return {
    body: parsed.content,
    frontmatter,
    frontmatterStrings,
    relativePath,
    schema: createMarkdownOutputSchema(frontmatterStrings),
    sourceText,
    sourcePath,
  };
}

export function deriveTargetMarkdownRoot(
  rootDir: string,
  sourceLocale: string,
  targetLocale: string,
): string {
  const basename = path.basename(rootDir);

  assert(
    basename === sourceLocale,
    `markdown.rootDir must end with the source locale "${sourceLocale}" so the CLI can mirror sibling locale folders.`,
  );

  return path.join(path.dirname(rootDir), targetLocale);
}

export function deriveTargetMarkdownPath(
  rootDir: string,
  sourceLocale: string,
  targetLocale: string,
  relativePath: string,
): string {
  return path.join(
    deriveTargetMarkdownRoot(rootDir, sourceLocale, targetLocale),
    relativePath,
  );
}
