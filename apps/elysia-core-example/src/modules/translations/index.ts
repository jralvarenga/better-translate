import { Elysia } from "elysia";

import {
  changeLocaleParams,
  changeLocaleResponse,
  invalidLocaleResponse,
  localeStateResponse,
  translationMessageResponse,
} from "./model";
import {
  changeLocale,
  getInvalidLocalePayload,
  getLocaleChangedPayload,
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
  .get(
    "/",
    () => getTranslationPayload("routes.home"),
    {
      response: translationMessageResponse,
    },
  )
  .get(
    "/hello",
    () => getTranslationPayload("routes.hello"),
    {
      response: translationMessageResponse,
    },
  )
  .group("/account", (app) =>
    app.get(
      "/balance",
      () => getTranslationPayload("account.balance.label"),
      {
        response: translationMessageResponse,
      },
    ),
  )
  .get(
    "/current-locale",
    () => getLocaleState(),
    {
      response: localeStateResponse,
    },
  )
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
