import type { GlobalStore } from "./types.js";

const GLOBAL_STORE_KEY = "__better_translate_core__";

/**
 * Returns the shared global store used to keep the configured translator.
 *
 * The store lives on `globalThis` so any module in the current project can
 * access the same translator after configuration.
 */
export function getGlobalStore(): GlobalStore {
  const globalScope = globalThis as typeof globalThis & {
    [GLOBAL_STORE_KEY]?: GlobalStore;
  };

  if (!globalScope[GLOBAL_STORE_KEY]) {
    globalScope[GLOBAL_STORE_KEY] = {};
  }

  return globalScope[GLOBAL_STORE_KEY];
}
