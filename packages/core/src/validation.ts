import type { RuntimeConfigInput, TranslationMessages } from "./types.js";

/**
 * Detects whether the input uses the full options-based configuration shape.
 *
 * This is used to distinguish the main `availableLocales` API from the short
 * locale-map form.
 */
export function isTranslationConfigOptions(
  value: RuntimeConfigInput,
): value is Extract<
  RuntimeConfigInput,
  { availableLocales: readonly string[]; defaultLocale: string }
> {
  return (
    "availableLocales" in value &&
    "defaultLocale" in value &&
    "messages" in value
  );
}

/**
 * Validates that a value matches the recursive translation object structure.
 *
 * Translation objects may contain nested objects and string leaf values only.
 */
export function isTranslationMessages(
  value: unknown,
): value is TranslationMessages {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((entry) => {
    if (entry === undefined || typeof entry === "string") {
      return true;
    }

    return isTranslationMessages(entry);
  });
}
