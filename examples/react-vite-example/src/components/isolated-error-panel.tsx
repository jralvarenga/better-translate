import {
  BetterTranslateProvider,
  useTranslations,
} from "@better-translate/react";

import type { FailureTranslator } from "../i18n.ts";
import { DemoPanel } from "./demo-panel.tsx";

function ErrorSandboxContent() {
  const { locale, localeError, setLocale, t } =
    useTranslations<FailureTranslator>();

  return (
    <DemoPanel
      eyebrow="Failures"
      title={t("demo.failureTitle")}
      description={t("demo.failureCopy")}
      actions={
        <button
          className="panel-button panel-button--danger"
          onClick={() => void setLocale("fr")}
          type="button"
        >
          {t("demo.failureAction")}
        </button>
      }
    >
      <dl className="metric-list">
        <div>
          <dt>{t("demo.failureCurrentLocale")}</dt>
          <dd data-testid="failure-locale">{locale}</dd>
        </div>
        <div>
          <dt>{t("demo.failureErrorLabel")}</dt>
          <dd data-testid="failure-error">
            {localeError instanceof Error
              ? localeError.message
              : t("demo.failureIdle")}
          </dd>
        </div>
      </dl>
    </DemoPanel>
  );
}

interface IsolatedErrorPanelProps {
  translator: FailureTranslator;
}

export function IsolatedErrorPanel({ translator }: IsolatedErrorPanelProps) {
  return (
    <BetterTranslateProvider translator={translator}>
      <ErrorSandboxContent />
    </BetterTranslateProvider>
  );
}
