import type {
  CachedMessages,
  InternalTranslationMessages,
  InternalTranslationNode,
  TranslationMessages,
} from "./types.js";

function cloneTranslationNode(
  node: InternalTranslationNode,
): InternalTranslationNode {
  if (typeof node === "string" || node === undefined) {
    return node;
  }

  const clonedEntries = Object.entries(node).map(([key, value]) => [
    key,
    cloneTranslationNode(value),
  ]);

  return Object.freeze(Object.fromEntries(clonedEntries));
}

/**
 * Creates an immutable snapshot of the cached locale message map.
 *
 * The snapshot is detached from the internal translator cache so callers can
 * inspect it without mutating stored translations.
 */
export function snapshotMessages<
  TLocale extends string,
  TSourceMessages extends TranslationMessages,
>(
  messages: Partial<Record<TLocale, InternalTranslationMessages>>,
): CachedMessages<TLocale, TSourceMessages> {
  const snapshotEntries = Object.entries(messages).map(([locale, value]) => [
    locale,
    cloneTranslationNode(value as InternalTranslationNode),
  ]);

  return Object.freeze(
    Object.fromEntries(snapshotEntries) as CachedMessages<
      TLocale,
      TSourceMessages
    >,
  );
}
