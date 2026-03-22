import type { TranslationParams } from "./types.js";

const PLACEHOLDER_PATTERN = /\{([^{}]+)\}/g;

/**
 * Replaces `{token}` placeholders in a resolved translation string.
 *
 * Missing params emit a warning and resolve to an empty string so callers can
 * notice the issue without breaking the whole response.
 */
export function interpolateMessage(
  message: string,
  key: string,
  params?: TranslationParams,
): string {
  const missingParams = new Set<string>();

  const interpolatedMessage = message.replace(
    PLACEHOLDER_PATTERN,
    (match, placeholderName: string) => {
      if (params && Object.prototype.hasOwnProperty.call(params, placeholderName)) {
        return String(params[placeholderName]);
      }

      missingParams.add(placeholderName);
      return "";
    },
  );

  for (const placeholderName of missingParams) {
    console.warn(
      `Missing translation param "{${placeholderName}}" for key "${key}".`,
    );
  }

  return interpolatedMessage;
}
