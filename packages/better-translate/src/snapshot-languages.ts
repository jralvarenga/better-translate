import type { TranslationLanguageMetadata } from "./types.js";

/**
 * Creates an immutable snapshot of the configured language metadata list.
 *
 * The snapshot is detached from the internal translator config so callers can
 * inspect it without mutating stored metadata.
 */
export function snapshotLanguages<TLocale extends string>(
  languages: readonly TranslationLanguageMetadata<TLocale>[],
): readonly TranslationLanguageMetadata<TLocale>[] {
  return Object.freeze(
    languages.map((language) =>
      Object.freeze({
        ...language,
      }),
    ),
  );
}
