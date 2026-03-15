import { useTranslations } from "@better-translate/react";

import type { AppTranslator } from "../i18n.ts";

const FLAG: Record<string, string> = { en: "EN", es: "ES", fr: "FR" };

export function SiteHeader() {
  const { locale, setLocale, supportedLocales, isLoadingLocale } =
    useTranslations<AppTranslator>();
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <span className="site-header__brand">better-translate</span>
        <nav className="site-header__nav" aria-label="Language switcher">
          {supportedLocales.map((loc) => (
            <button
              key={loc}
              type="button"
              className={`site-header__locale-btn${locale === loc ? " site-header__locale-btn--active" : ""}`}
              onClick={() => void setLocale(loc)}
              disabled={isLoadingLocale}
              aria-pressed={locale === loc}
            >
              {isLoadingLocale && locale !== loc ? (
                <span className="spinner" aria-hidden="true" />
              ) : null}
              {FLAG[loc] ?? loc.toUpperCase()}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
