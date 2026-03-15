import { useTranslations } from "@better-translate/react";

import { DemoPanel } from "./demo-panel.tsx";
import type { AppTranslator } from "../i18n.ts";

const ACTION_LABELS = {
  en: "actions.switchToEnglish",
  es: "actions.switchToSpanish",
  fr: "actions.switchToFrench",
} as const;

export function LocaleSwitcherPanel() {
  const { isLoadingLocale, loadLocale, locale, setLocale, supportedLocales, t } =
    useTranslations<AppTranslator>();

  return (
    <DemoPanel
      eyebrow="Locales"
      title={t("demo.switcherTitle")}
      description={t("demo.switcherCopy")}
      actions={
        <button
          className="panel-button panel-button--ghost"
          disabled={isLoadingLocale}
          onClick={() => void loadLocale("fr")}
          type="button"
        >
          {isLoadingLocale ? t("demo.asyncPending") : t("demo.asyncAction")}
        </button>
      }
    >
      <div className="locale-switcher">
        {supportedLocales.map((supportedLocale) => (
          <button
            key={supportedLocale}
            aria-pressed={locale === supportedLocale}
            className="panel-button"
            disabled={isLoadingLocale && locale !== supportedLocale}
            onClick={() => void setLocale(supportedLocale)}
            type="button"
          >
            {t(ACTION_LABELS[supportedLocale])}
          </button>
        ))}
      </div>
    </DemoPanel>
  );
}
