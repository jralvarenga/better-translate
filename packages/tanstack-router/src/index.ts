import { SUPPORTED_LOCALE_ROUTE_SYNTAXES } from "@better-translate/core";

function formatLocaleRouteSyntaxes<
  const TValues extends readonly string[],
  const TPrefix extends string,
  const TSuffix extends string,
>(
  values: TValues,
  prefix: TPrefix,
  suffix: TSuffix,
): {
  readonly [K in keyof TValues]: `${TPrefix}${TValues[K] & string}${TSuffix}`;
} {
  return values.map((value) => `${prefix}${value}${suffix}`) as {
    readonly [K in keyof TValues]: `${TPrefix}${TValues[K] & string}${TSuffix}`;
  };
}

export const SUPPORTED_TANSTACK_REQUIRED_LOCALE_ROUTE_SYNTAXES =
  formatLocaleRouteSyntaxes(SUPPORTED_LOCALE_ROUTE_SYNTAXES, "$", "");

export const SUPPORTED_TANSTACK_BRACED_REQUIRED_LOCALE_ROUTE_SYNTAXES =
  formatLocaleRouteSyntaxes(SUPPORTED_LOCALE_ROUTE_SYNTAXES, "{$", "}");

export const SUPPORTED_TANSTACK_OPTIONAL_LOCALE_ROUTE_SYNTAXES =
  formatLocaleRouteSyntaxes(SUPPORTED_LOCALE_ROUTE_SYNTAXES, "{-$", "}");

export const SUPPORTED_TANSTACK_LOCALE_ROUTE_SYNTAXES = [
  ...SUPPORTED_TANSTACK_REQUIRED_LOCALE_ROUTE_SYNTAXES,
  ...SUPPORTED_TANSTACK_BRACED_REQUIRED_LOCALE_ROUTE_SYNTAXES,
  ...SUPPORTED_TANSTACK_OPTIONAL_LOCALE_ROUTE_SYNTAXES,
] as const;

export {
  defineRouting,
  getPathnameLocale,
  hasLocale,
  isPathnameInScope,
  localizePathname,
  stripLocaleFromPathname,
} from "./shared.js";

export type { DefinedRouting, RoutingConfig } from "./shared.js";
