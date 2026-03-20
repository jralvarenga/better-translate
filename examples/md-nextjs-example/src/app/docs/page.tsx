import Link from "next/link";
import { Header } from "@/components/header";
import { getCurrentLocale, getMarkdownHelpers, getTranslations } from "@/lib/i18n/server";

export default async function DocsPage() {
  const [locale, t, md] = await Promise.all([
    getCurrentLocale(),
    getTranslations(),
    getMarkdownHelpers(),
  ]);

  const ids = await md.listDocuments();
  const docs = await Promise.all(ids.map((id) => md.getDocument(id, { locale })));

  return (
    <div className="min-h-screen">
      <Header
        currentLocale={locale}
        navHome={t("nav.home")}
        navDocs={t("nav.docs")}
        localeLabel={t("locale.current")}
      />

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t("docs.title")}</h1>
          <p className="text-muted">{t("docs.subtitle")}</p>
        </div>

        {docs.length === 0 ? (
          <p className="text-muted">{t("docs.noDocuments")}</p>
        ) : (
          <div className="grid gap-3">
            {docs.map((doc) => {
              const title = (doc.frontmatter.title as string) ?? doc.id;
              const description = doc.frontmatter.description as string | undefined;
              const date = doc.frontmatter.date as string | undefined;
              const href = "/" + doc.id;

              return (
                <Link
                  key={doc.id}
                  href={href}
                  className="group block rounded-xl border border-white/10 bg-white/[0.03] p-5 hover:border-brand/40 hover:bg-brand/5 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono font-medium ${
                            doc.kind === "mdx"
                              ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                              : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                          }`}
                        >
                          .{doc.kind}
                        </span>
                        {doc.usedFallback && (
                          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono bg-amber-500/15 text-amber-300 border border-amber-500/20">
                            fallback
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-foreground group-hover:text-brand transition-colors">
                        {title}
                      </div>
                      {description && (
                        <div className="text-sm text-muted mt-1">{description}</div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      {date && (
                        <div className="text-xs font-mono text-muted">{String(date)}</div>
                      )}
                      <div className="text-xs font-mono text-muted/60 mt-0.5">
                        {doc.locale}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
