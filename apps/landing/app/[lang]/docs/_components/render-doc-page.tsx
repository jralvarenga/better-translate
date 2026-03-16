import { readFile } from "node:fs/promises";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { CopyButton } from "@/components/copy-button";
import { docsComponents } from "@/components/docs-components";
import { md } from "@/lib/i18n/md";

export async function renderDocPage(
  documentId: string,
  locale: "en" | "es",
) {
  const doc = await md.getDocument(documentId, { locale });
  const [{ default: Content }, markdownSource] = await Promise.all([
    evaluate(doc.source, {
      ...(runtime as Parameters<typeof evaluate>[1]),
    }),
    readFile(doc.path, "utf8"),
  ]);

  return (
    <div className="max-w-3xl px-6 py-10 lg:px-10">
      <div className="mb-4 flex justify-end">
        <CopyButton
          label="Copy markdown"
          copiedLabel="Copied"
          text={markdownSource}
          className="inline-flex items-center rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        />
      </div>
      <Content components={docsComponents as any} />
    </div>
  );
}
