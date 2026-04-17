import { BetterTranslateProvider as BaseBetterTranslateProvider } from "./provider.js";
import type {
  AnyBetterTranslateTranslator,
  CreateBetterTranslateReactResult,
  TypedBetterTranslateProviderProps,
} from "./types.js";
import { useTranslations as useBaseTranslations } from "./use-translations.js";

/**
 * Binds a translator to a provider/hook pair so app code gets typed
 * `useTranslations()` without repeating generics or adding module augmentation.
 */
export function createBetterTranslateReact<
  TTranslator extends AnyBetterTranslateTranslator,
>(translator: TTranslator): CreateBetterTranslateReactResult<TTranslator> {
  function BetterTranslateProvider({
    children,
    initialLocale,
    translator: overrideTranslator,
  }: TypedBetterTranslateProviderProps<TTranslator>) {
    return (
      <BaseBetterTranslateProvider
        initialLocale={initialLocale}
        translator={overrideTranslator ?? translator}
      >
        {children}
      </BaseBetterTranslateProvider>
    );
  }

  function useTranslations() {
    return useBaseTranslations<TTranslator>();
  }

  return {
    BetterTranslateProvider,
    useTranslations,
  };
}
