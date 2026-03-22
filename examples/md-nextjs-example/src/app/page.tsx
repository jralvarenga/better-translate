import Link from "next/link";
import { Header } from "@/components/header";
import { getCurrentLocale, getTranslations } from "@/lib/i18n/server";

export default async function HomePage() {
  const [locale, t] = await Promise.all([
    getCurrentLocale(),
    getTranslations(),
  ]);

  return (
    <div className="min-h-screen">
      <Header
        currentLocale={locale}
        navHome={t("nav.home")}
        navDocs={t("nav.docs")}
        localeLabel={t("locale.current")}
      />

      <main className="mx-auto max-w-4xl px-6 py-20">
        {/* Hero */}
        <div className="mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-mono text-brand">
            <span className="size-1.5 rounded-full bg-brand" />
            better-translate/core + @better-translate/md
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {t("home.title")}
          </h1>
          <p className="text-lg text-muted max-w-2xl leading-relaxed">
            {t("home.subtitle")}
          </p>
        </div>

        {/* Description card */}
        <div className="mb-12 rounded-xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-muted leading-relaxed">
            {t("home.description")}
          </p>
        </div>

        {/* Stack */}
        <div className="mb-12">
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted mb-4">
            {t("home.stack")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                pkg: "better-translate/core",
                desc: "UI string translations with typed keys and locale override.",
              },
              {
                pkg: "@better-translate/md",
                desc: "Localized Markdown (.md) and MDX (.mdx) content with fallback.",
              },
              {
                pkg: "Cookie-based locale",
                desc: "Language stored in a cookie. Normal routes ,  no /[lang] in the URL.",
              },
              {
                pkg: "@mdx-js/mdx evaluate()",
                desc: "MDX documents compiled and evaluated into React components at render time.",
              },
            ].map(({ pkg, desc }) => (
              <div
                key={pkg}
                className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="font-mono text-sm font-semibold text-foreground mb-1">
                  {pkg}
                </div>
                <div className="text-xs text-muted">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 transition-colors"
        >
          {t("home.viewDocs")}
          <span>→</span>
        </Link>
      </main>
    </div>
  );
}
