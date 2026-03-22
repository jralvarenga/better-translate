import { notFound } from "next/navigation";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { Header } from "@/components/header";
import { mdxComponents } from "@/components/mdx-components";
import { MarkdownDocumentNotFoundError } from "@better-translate/md";
import { getCurrentLocale, getMarkdownHelpers, getTranslations } from "@/lib/i18n/server";

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const id = `docs/${slug.join("/")}`;

  const [locale, t, md] = await Promise.all([
    getCurrentLocale(),
    getTranslations(),
    getMarkdownHelpers(),
  ]);

  let doc;
  try {
    doc = await md.getDocument(id, { locale });
  } catch (err) {
    if (err instanceof MarkdownDocumentNotFoundError) {
      notFound();
    }
    throw err;
  }

  const title = (doc.frontmatter.title as string) ?? doc.id;
  const description = doc.frontmatter.description as string | undefined;
  const date = doc.frontmatter.date as string | undefined;

  // Render MD → compiled HTML
  let mdHtml: string | null = null;
  // Render MDX → evaluated React component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let MdxContent: React.FC<{ components?: Record<string, unknown> }> | null = null;

  if (doc.kind === "md") {
    const compiled = await md.compileDocument(doc);
    if (compiled.kind === "md") {
      mdHtml = compiled.html;
    }
  } else {
    // doc.source has frontmatter already stripped by gray-matter in getDocument()
    // evaluate() compiles with jsx:false and runs ,  compatible with Node.js dynamic import
    const result = await evaluate(doc.source, {
      ...(runtime as Parameters<typeof evaluate>[1]),
    });
    MdxContent = result.default as React.FC<{ components?: Record<string, unknown> }>;
  }

  const fallbackBanner = doc.usedFallback
    ? t("fallback.banner", {
        requested: doc.requestedLocale.toUpperCase(),
        fallback: doc.locale.toUpperCase(),
      })
    : null;

  return (
    <div className="min-h-screen">
      <Header
        currentLocale={locale}
        navHome={t("nav.home")}
        navDocs={t("nav.docs")}
        localeLabel={t("locale.current")}
      />

      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* Fallback banner */}
        {fallbackBanner && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <span className="mt-0.5 text-amber-400 text-sm">⚠</span>
            <p className="text-sm text-amber-200">{fallbackBanner}</p>
          </div>
        )}

        {/* Frontmatter header */}
        <div className="mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono font-medium ${
                doc.kind === "mdx"
                  ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                  : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
              }`}
            >
              .{doc.kind}
            </span>
            <span className="text-xs font-mono text-muted">{doc.locale}</span>
            {date && (
              <span className="text-xs font-mono text-muted/60">{String(date)}</span>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="mt-2 text-muted">{description}</p>}
        </div>

        {/* Content */}
        <div className="prose">
          {mdHtml && (
            <div dangerouslySetInnerHTML={{ __html: mdHtml }} />
          )}
          {MdxContent && (() => {
            const C = MdxContent!;
            return <C components={mdxComponents as Record<string, unknown>} />;
          })()}
        </div>
      </main>
    </div>
  );
}
