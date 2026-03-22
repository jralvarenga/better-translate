import { Elysia } from "elysia";

import {
  changeLocaleParams,
  changeLocaleResponse,
  greetingParams,
  invalidLocaleResponse,
  localeParams,
  localeStateResponse,
  translationMessageResponse,
} from "./model";
import {
  changeLocale,
  getGreetingPayload,
  getInvalidLocalePayload,
  getLocaleChangedPayload,
  getLocaleResponsePayload,
  getLocaleState,
  getTranslationPayload,
  isLocale,
} from "./service";

/**
 * Translation routes for the example API.
 *
 * The module keeps HTTP concerns here while the translation state and runtime
 * orchestration live in the service layer.
 */
export const translationModule = new Elysia({
  name: "translation-module",
})
  .get("/", () => getTranslationPayload("routes.home"), {
    response: translationMessageResponse,
  })
  .get("/hello", () => getTranslationPayload("routes.hello"), {
    response: translationMessageResponse,
  })
  .get("/greeting/:name", ({ params: { name } }) => getGreetingPayload(name), {
    params: greetingParams,
    response: translationMessageResponse,
  })
  .group("/account", (app) =>
    app.get("/balance", () => getTranslationPayload("account.balance.label"), {
      response: translationMessageResponse,
    }),
  )
  .group("/api", (app) =>
    app.get(
      "/:locale/response",
      ({ params: { locale }, status }) => {
        if (!isLocale(locale)) {
          return status(400, getInvalidLocalePayload());
        }
        return getLocaleResponsePayload(locale);
      },
      {
        params: localeParams,
        response: {
          200: translationMessageResponse,
          400: invalidLocaleResponse,
        },
      },
    ),
  )
  .get("/current-locale", () => getLocaleState(), {
    response: localeStateResponse,
  })
  .get(
    "/change-locale/:language",
    async ({ params: { language }, status }) => {
      if (!isLocale(language)) {
        return status(400, getInvalidLocalePayload());
      }

      await changeLocale(language);

      return getLocaleChangedPayload();
    },
    {
      params: changeLocaleParams,
      response: {
        200: changeLocaleResponse,
        400: invalidLocaleResponse,
      },
    },
  );
