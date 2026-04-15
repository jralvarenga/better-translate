import { useTranslations } from "../i18n.ts";

import { DemoPanel } from "./demo-panel.tsx";

export function MessagesPanel() {
  const { locale, messages, t } = useTranslations();
  const hasFrench = Object.prototype.hasOwnProperty.call(messages, "fr");

  return (
    <DemoPanel
      eyebrow="Cache"
      title={t("demo.messageCacheTitle")}
      description={t("demo.messageCacheCopy")}
    >
      <div className="callout">
        <span>{t("demo.currentLocale")}</span>
        <strong data-testid="message-panel-locale">{locale}</strong>
      </div>
      <div className="callout">
        <span>French cache</span>
        <strong data-testid="french-cache-status">
          {hasFrench ? t("demo.asyncReady") : "Not loaded yet"}
        </strong>
      </div>
      <pre className="message-preview" data-testid="messages-json">
        {JSON.stringify(messages, null, 2)}
      </pre>
    </DemoPanel>
  );
}
