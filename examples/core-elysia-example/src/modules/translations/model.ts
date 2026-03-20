import { t } from "elysia";

const localeSchema = t.Union([t.Literal("en"), t.Literal("es")]);

export const translationMessageResponse = t.Object({
  key: t.String(),
  message: t.String(),
  currentLocale: localeSchema,
});

export const localeStateResponse = t.Object({
  currentLocale: localeSchema,
  fallbackLocale: localeSchema,
  supportedLocales: t.Array(localeSchema),
});

export const changeLocaleParams = t.Object({
  language: t.String(),
});

export const greetingParams = t.Object({
  name: t.String(),
});

export const changeLocaleResponse = t.Object({
  message: t.String(),
  currentLocale: localeSchema,
  supportedLocales: t.Array(localeSchema),
});

export const localeParams = t.Object({
  locale: t.String(),
});

export const invalidLocaleResponse = t.Object({
  error: t.String(),
  supportedLocales: t.Array(localeSchema),
});
