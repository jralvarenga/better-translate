import { useTranslations } from "../i18n.ts";

export function HeaderPanel() {
  const { t } = useTranslations();

  return (
    <section className="hero-panel">
      <div className="hero-panel__orb" aria-hidden="true" />
      <div className="hero-panel__badge">better-translate + react</div>
      <h1>{t("demo.title")}</h1>
      <p className="hero-panel__summary">{t("demo.summary")}</p>
      <div className="hero-panel__lead">
        <code>{t("common.hello")}</code>
        <code>{t("account.balance.label")}</code>
      </div>
    </section>
  );
}
