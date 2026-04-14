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

export const SUPPORTED_NEXTJS_LOCALE_ROUTE_SYNTAXES = formatLocaleRouteSyntaxes(
  SUPPORTED_LOCALE_ROUTE_SYNTAXES,
  "[",
  "]",
);

export {
  defineRouting,
  getDomainForLocale,
  getLocaleFromDomain,
  getPathnameLocale,
  hasLocale,
  isPathnameInScope,
  localizePathname,
  stripLocaleFromPathname,
} from "./shared.js";

export type {
  DefinedRouting,
  RoutingConfig,
  RoutingDomain,
} from "./shared.js";
