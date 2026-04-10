import "server-only";
import { readFile } from "node:fs/promises";
import type { ReactNode } from "react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { CopyButton } from "@/components/copy-button";
import { docsComponents } from "@/components/docs-components";
import type { LandingLocale } from "@/lib/i18n/config";
import { getDocPageDocument } from "@/lib/docs";
import { getTranslations } from "@/lib/i18n/server";

export async function renderDocPage(documentId: string, locale: LandingLocale) {
  const doc = await getDocPageDocument(documentId, locale);
  const t = await getTranslations();
  const [{ default: MdxContent }, markdownSource] = await Promise.all([
    evaluate(doc.source, {
      ...(runtime as Parameters<typeof evaluate>[1]),
    }),
    readFile(doc.path, "utf8"),
  ]);
  const Content = MdxContent as (props: {
    components?: typeof docsComponents;
  }) => ReactNode;

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 lg:px-10">
      <div className="mb-4 flex justify-end">
        <CopyButton
          label={t("docs.copyMarkdown")}
          copiedLabel={t("docs.copiedMarkdown")}
          text={markdownSource}
          className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        />
      </div>
      <Content components={docsComponents} />
    </div>
  );
}
