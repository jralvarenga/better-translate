import type {
  InternalTranslationMessages,
  InternalTranslationNode,
} from "./types.js";

/**
 * Resolves a dot-notation key like `account.balance.label` inside a locale
 * message tree and returns the string value when present.
 */
export function resolveMessageValue(
  messages: InternalTranslationMessages | undefined,
  key: string,
): string | undefined {
  if (!messages) {
    return undefined;
  }

  const parts = key.split(".");
  let current: InternalTranslationNode = messages;

  for (const part of parts) {
    if (typeof current !== "object" || current === null) {
      return undefined;
    }

    current = current[part];
  }

  return typeof current === "string" ? current : undefined;
}
