import { createServerFn } from "@tanstack/react-start";

import type { AppLocale } from "./routing";

const localeInput = (input: { locale: AppLocale }) => input;

async function getScopedTranslations(locale: AppLocale) {
  const [{ createServerHelpers, setRequestLocale }, { requestConfig }] =
    await Promise.all([
      import("@better-translate/tanstack-router/server"),
      import("./request"),
    ]);
  const { getTranslations } = createServerHelpers(requestConfig);

  setRequestLocale(locale);
  return getTranslations({ locale });
}

export const getChromeCopy = createServerFn({ method: "GET" })
  .inputValidator(localeInput)
  .handler(async ({ data }) => {
    const t = await getScopedTranslations(data.locale);

    return {
      guideLabel: t("navigation.guide"),
      homeLabel: t("navigation.home"),
      loginLabel: t("navigation.login"),
      locale: data.locale,
      switchLabel: t("navigation.switchLanguage"),
    };
  });

export const getHomeCopy = createServerFn({ method: "GET" })
  .inputValidator(localeInput)
  .handler(async ({ data }) => {
    const t = await getScopedTranslations(data.locale);

    return {
      badge: t("home.badge"),
      description: t("home.description"),
      primaryCta: t("home.primaryCta"),
      secondaryCta: t("home.secondaryCta"),
      supportingCopy: t("home.supportingCopy"),
      title: t("home.title"),
    };
  });

export const getGuideCopy = createServerFn({ method: "GET" })
  .inputValidator(localeInput)
  .handler(async ({ data }) => {
    const t = await getScopedTranslations(data.locale);

    return {
      backToHome: t("guide.backToHome"),
      badge: t("guide.badge"),
      description: t("guide.description"),
      navigationDescription: t("guide.navigationDescription"),
      navigationTitle: t("guide.navigationTitle"),
      openLogin: t("guide.openLogin"),
      routeTreeDescription: t("guide.routeTreeDescription"),
      routeTreeTitle: t("guide.routeTreeTitle"),
      title: t("guide.title"),
    };
  });

export const getLoginCopy = createServerFn({ method: "GET" })
  .inputValidator(localeInput)
  .handler(async ({ data }) => {
    const t = await getScopedTranslations(data.locale);

    return {
      badge: t("login.badge"),
      description: t("login.description"),
      primaryCta: t("login.primaryCta"),
      secondaryCta: t("login.secondaryCta"),
      title: t("login.title"),
    };
  });
