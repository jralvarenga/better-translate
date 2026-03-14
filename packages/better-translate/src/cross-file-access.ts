import { getMessages, t } from "./core.js";

/**
 * Reads messages and translated values from a different module to verify that
 * configured translations are shared through the global runtime store.
 */
export function readConfiguredTranslationsFromAnotherFile() {
  return {
    messages: getMessages(),
    greeting: t("common.hello"),
  };
}
