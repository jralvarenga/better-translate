import type {
  ConfiguredTranslator,
  TranslationMessages,
} from "better-translate/core";

export type AnyBetterTranslateTranslator = ConfiguredTranslator<
  any,
  TranslationMessages
>;

export type InferLocale<TTranslator extends AnyBetterTranslateTranslator> =
  TTranslator extends ConfiguredTranslator<infer TLocale, TranslationMessages>
    ? TLocale
    : never;

export type MarkdownDocumentExtension = ".md" | ".mdx";

export interface MarkdownHelpersOptions {
  rootDir: string;
  extensions?: readonly MarkdownDocumentExtension[];
}

export interface MarkdownCollectionConfig<
  TTranslator extends AnyBetterTranslateTranslator,
> extends MarkdownHelpersOptions {
  translator: TTranslator;
}

export interface MarkdownDocumentOptions<TLocale extends string> {
  locale?: TLocale;
}

export interface LocalizedMarkdownDocument<TLocale extends string> {
  frontmatter: Record<string, unknown>;
  id: string;
  kind: "md" | "mdx";
  locale: TLocale;
  path: string;
  requestedLocale: TLocale;
  source: string;
  usedFallback: boolean;
}

interface CompiledMarkdownDocumentBase<TLocale extends string>
  extends LocalizedMarkdownDocument<TLocale> {
  compiled: string;
}

export interface CompiledMarkdownHtmlDocument<TLocale extends string>
  extends CompiledMarkdownDocumentBase<TLocale> {
  html: string;
  kind: "md";
}

export interface CompiledMarkdownMdxDocument<TLocale extends string>
  extends CompiledMarkdownDocumentBase<TLocale> {
  code: string;
  kind: "mdx";
}

export type CompiledMarkdownResult<TLocale extends string = string> =
  | CompiledMarkdownHtmlDocument<TLocale>
  | CompiledMarkdownMdxDocument<TLocale>;

export interface MarkdownCollection<TLocale extends string> {
  compileDocument(
    documentId: string,
    options?: MarkdownDocumentOptions<TLocale>,
  ): Promise<CompiledMarkdownResult<TLocale>>;
  compileDocument(
    document: LocalizedMarkdownDocument<TLocale>,
  ): Promise<CompiledMarkdownResult<TLocale>>;
  getDocument(
    documentId: string,
    options?: MarkdownDocumentOptions<TLocale>,
  ): Promise<LocalizedMarkdownDocument<TLocale>>;
  listDocuments(): Promise<string[]>;
}

export interface MarkdownServerHelpers<TLocale extends string> {
  compileDocument(
    documentId: string,
    options?: MarkdownDocumentOptions<TLocale>,
  ): Promise<CompiledMarkdownResult<TLocale>>;
  compileDocument(
    document: LocalizedMarkdownDocument<TLocale>,
  ): Promise<CompiledMarkdownResult<TLocale>>;
  getCollection(): Promise<MarkdownCollection<TLocale>>;
  getDocument(
    documentId: string,
    options?: MarkdownDocumentOptions<TLocale>,
  ): Promise<LocalizedMarkdownDocument<TLocale>>;
}

export class MarkdownDocumentNotFoundError extends Error {
  readonly fallbackLocale: string;
  readonly id: string;
  readonly lookedUpPaths: readonly string[];
  readonly requestedLocale: string;

  constructor(options: {
    fallbackLocale: string;
    id: string;
    lookedUpPaths: readonly string[];
    requestedLocale: string;
  }) {
    super(
      `Markdown document "${options.id}" was not found for locale "${options.requestedLocale}" or fallback locale "${options.fallbackLocale}".`,
    );

    this.name = "MarkdownDocumentNotFoundError";
    this.id = options.id;
    this.requestedLocale = options.requestedLocale;
    this.fallbackLocale = options.fallbackLocale;
    this.lookedUpPaths = options.lookedUpPaths;
  }
}
