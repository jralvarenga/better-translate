import type { MarkdownExtension } from "./types.js";

type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function isTranslationMessages(value: unknown): value is UnknownRecord {
  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every((entry) => {
    if (typeof entry === "string") {
      return true;
    }

    return isTranslationMessages(entry);
  });
}

export function assertTranslationMessages(
  value: unknown,
  message: string,
): asserts value is UnknownRecord {
  assert(isTranslationMessages(value), message);
}

export function flattenTranslationKeys(
  messages: UnknownRecord,
  prefix = "",
): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(messages)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "string") {
      keys.push(nextKey);
      continue;
    }

    keys.push(...flattenTranslationKeys(value as UnknownRecord, nextKey));
  }

  return keys;
}

export function assertExactMessageShape(
  reference: UnknownRecord,
  candidate: unknown,
  pathParts: string[] = [],
): asserts candidate is UnknownRecord {
  assert(
    isRecord(candidate),
    `Generated translations must be an object at "${pathParts.join(".") || "<root>"}".`,
  );

  const referenceKeys = Object.keys(reference).sort();
  const candidateKeys = Object.keys(candidate).sort();

  assert(
    referenceKeys.length === candidateKeys.length,
    `Generated translations changed the keys at "${pathParts.join(".") || "<root>"}".`,
  );

  for (const key of referenceKeys) {
    assert(
      key in candidate,
      `Generated translations are missing the key "${[...pathParts, key].join(".")}".`,
    );

    const referenceValue = reference[key];
    const candidateValue = candidate[key];

    if (typeof referenceValue === "string") {
      assert(
        typeof candidateValue === "string",
        `Generated translations must keep "${[...pathParts, key].join(".")}" as a string.`,
      );
      continue;
    }

    assertExactMessageShape(
      referenceValue as UnknownRecord,
      candidateValue,
      [...pathParts, key],
    );
  }
}

export function normalizeMarkdownExtensions(
  value: unknown,
): readonly MarkdownExtension[] {
  if (value === undefined) {
    return [".md", ".mdx"];
  }

  assert(Array.isArray(value), "markdown.extensions must be an array when provided.");
  assert(value.length > 0, "markdown.extensions must include at least one extension.");

  const normalized = [...new Set(value)] as unknown[];

  for (const extension of normalized) {
    assert(
      extension === ".md" || extension === ".mdx",
      'markdown.extensions only supports ".md" and ".mdx".',
    );
  }

  return normalized as readonly MarkdownExtension[];
}

export function toJavaScriptIdentifier(value: string): string {
  const parts = value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.toLowerCase());

  if (parts.length === 0) {
    return "messages";
  }

  const [head, ...tail] = parts;
  const identifier = `${head}${tail
    .map((part) => `${part[0]!.toUpperCase()}${part.slice(1)}`)
    .join("")}`;

  return /^[a-zA-Z_$]/.test(identifier) ? identifier : `_${identifier}`;
}
