import { useTranslations } from "@better-translate/react";

import { DemoPanel } from "./demo-panel.tsx";
import type { AppTranslator } from "../i18n.ts";

export function LocaleStatusPanel() {
  const {
    defaultLocale,
    fallbackLocale,
    isLoadingLocale,
    loadingLocale,
    locale,
    localeError,
    messages,
    t,
  } = useTranslations<AppTranslator>();

  const cachedLocales = Object.keys(messages).join(", ");

  return (
    <DemoPanel
      eyebrow="State"
      title={t("demo.currentLocale")}
      description={t("demo.switcherCopy")}
    >
      <dl className="metric-list">
        <div>
          <dt>{t("demo.currentLocale")}</dt>
          <dd data-testid="current-locale">{locale}</dd>
        </div>
        <div>
          <dt>{t("demo.defaultLocale")}</dt>
          <dd>{defaultLocale}</dd>
        </div>
        <div>
          <dt>{t("demo.fallbackLocale")}</dt>
          <dd>{fallbackLocale}</dd>
        </div>
        <div>
          <dt>{t("demo.loadingLocale")}</dt>
          <dd>{isLoadingLocale ? loadingLocale ?? "pending" : t("demo.localeReady")}</dd>
        </div>
        <div>
          <dt>{t("demo.cachedLocales")}</dt>
          <dd data-testid="cached-locales">{cachedLocales}</dd>
        </div>
        <div>
          <dt>Error</dt>
          <dd data-testid="status-error">
            {localeError instanceof Error ? localeError.message : "none"}
          </dd>
        </div>
      </dl>
    </DemoPanel>
  );
}
