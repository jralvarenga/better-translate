import { useContext } from "react";

import { BetterTranslateContext } from "./context.js";
import type {
  AnyBetterTranslateTranslator,
  DefaultBetterTranslateTranslator,
  UseTranslationsValue,
} from "./types.js";

/**
 * Returns the Better Translate React context for the current subtree.
 *
 * Throws when used outside `BetterTranslateProvider`.
 */
export function useTranslations<
  TTranslator extends
    AnyBetterTranslateTranslator = DefaultBetterTranslateTranslator,
>(): UseTranslationsValue<TTranslator> {
  const context = useContext(BetterTranslateContext);

  if (!context) {
    throw new Error(
      "useTranslations() must be used inside <BetterTranslateProvider />.",
    );
  }

  return context as UseTranslationsValue<TTranslator>;
}
