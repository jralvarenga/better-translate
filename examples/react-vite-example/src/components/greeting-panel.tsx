import { useState } from "react";

import { useTranslations } from "@better-translate/react";

import { DemoPanel } from "./demo-panel.tsx";
import type { AppTranslator } from "../i18n.ts";

export function GreetingPanel() {
  const { t } = useTranslations<AppTranslator>();
  const [salute, setSalute] = useState("Dr.");
  const [name, setName] = useState("Ada");

  return (
    <DemoPanel
      eyebrow="Typing"
      title={t("demo.greetingTitle")}
      description={t("demo.greetingCopy")}
    >
      <form className="greeting-form">
        <label>
          <span>{t("fields.salute")}</span>
          <input
            name="salute"
            onChange={(event) => {
              setSalute(event.target.value);
            }}
            value={salute}
          />
        </label>
        <label>
          <span>{t("fields.name")}</span>
          <input
            name="name"
            onChange={(event) => {
              setName(event.target.value);
            }}
            value={name}
          />
        </label>
      </form>
      <div className="callout">
        <span>{t("demo.greetingOutput")}</span>
        <strong data-testid="formal-greeting">
          {t("common.formalGreeting", {
            params: {
              salute,
              name,
            },
          })}
        </strong>
      </div>
    </DemoPanel>
  );
}
