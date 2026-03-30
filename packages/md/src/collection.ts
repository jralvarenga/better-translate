import { compile } from "@mdx-js/mdx";
import matter from "gray-matter";
import { access, readdir, readFile } from "node:fs/promises";
import { join, posix, relative, resolve } from "node:path";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

import type {
  AnyBetterTranslateTranslator,
  CompiledMarkdownHtmlDocument,
  CompiledMarkdownMdxDocument,
  CompiledMarkdownResult,
  InferLocale,
  LocalizedMarkdownDocument,
  MarkdownCollection,
  MarkdownCollectionConfig,
  MarkdownDocumentExtension,
  MarkdownDocumentOptions,
  MarkdownHelpersOptions,
} from "./types.js";
import { MarkdownDocumentNotFoundError } from "./types.js";

const DEFAULT_EXTENSIONS = [
  ".mdx",
  ".md",
] as const satisfies readonly MarkdownDocumentExtension[];

function isMarkdownDocumentExtension(
  value: string,
): value is MarkdownDocumentExtension {
  return value === ".md" || value === ".mdx";
}

function normalizeExtensions(
  extensions?: readonly MarkdownDocumentExtension[],
): readonly MarkdownDocumentExtension[] {
  const resolvedExtensions = extensions ?? DEFAULT_EXTENSIONS;

  if (resolvedExtensions.length === 0) {
    throw new Error(
      "Markdown helpers require at least one supported extension.",
    );
  }

  const uniqueExtensions = [...new Set(resolvedExtensions)];

  if (!uniqueExtensions.every(isMarkdownDocumentExtension)) {
    throw new Error(
      'Markdown helpers only support ".md" and ".mdx" extensions.',
    );
  }

  return uniqueExtensions;
}

function normalizeDocumentId(documentId: string): string {
  const trimmedDocumentId = documentId.trim();

  if (!trimmedDocumentId) {
    throw new Error("Markdown document ids cannot be empty.");
  }

  const normalizedDocumentId = posix
    .normalize(trimmedDocumentId.replaceAll("\\", "/").replace(/^\/+/, ""))
    .replace(/\/+$/, "");

  if (
    normalizedDocumentId === "." ||
    normalizedDocumentId.startsWith("../") ||
    normalizedDocumentId.includes("/../")
  ) {
    throw new Error(
      `Markdown document id "${documentId}" cannot escape the configured rootDir.`,
    );
  }

  return normalizedDocumentId;
}

async function pathExists(pathname: string): Promise<boolean> {
  try {
    await access(pathname);
    return true;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return false;
    }

    throw error;
  }
}

async function walkDirectory(directory: string): Promise<string[]> {
  const entries = await readdir(directory, {
    withFileTypes: true,
  });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        return walkDirectory(entryPath);
      }

      if (entry.isFile()) {
        return [entryPath];
      }

      return [];
    }),
  );

  return files.flat();
}

function assertSupportedLocale<TLocale extends string>(
  locale: string,
  supportedLocales: readonly TLocale[],
): asserts locale is TLocale {
  if (!supportedLocales.includes(locale as TLocale)) {
    throw new Error(
      `The locale "${locale}" is not included in the translator's supported locales.`,
    );
  }
}

async function compileMarkdownDocument<TLocale extends string>(
  document: LocalizedMarkdownDocument<TLocale>,
): Promise<CompiledMarkdownResult<TLocale>> {
  if (document.kind === "mdx") {
    const compiled = String(
      await compile(document.source, {
        format: "mdx",
        jsx: true,
        jsxImportSource: "react",
        outputFormat: "program",
      }),
    );

    const compiledDocument: CompiledMarkdownMdxDocument<TLocale> = {
      code: compiled,
      compiled,
      frontmatter: document.frontmatter,
      id: document.id,
      kind: "mdx",
      locale: document.locale,
      path: document.path,
      requestedLocale: document.requestedLocale,
      source: document.source,
      usedFallback: document.usedFallback,
    };

    return compiledDocument;
  }

  const html = String(
    await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(document.source),
  );
  const compiledDocument: CompiledMarkdownHtmlDocument<TLocale> = {
    compiled: html,
    frontmatter: document.frontmatter,
    html,
    id: document.id,
    kind: "md",
    locale: document.locale,
    path: document.path,
    requestedLocale: document.requestedLocale,
    source: document.source,
    usedFallback: document.usedFallback,
  };

  return compiledDocument;
}

function createCandidatePaths(
  rootDir: string,
  locale: string,
  documentId: string,
  extensions: readonly MarkdownDocumentExtension[],
) {
  const documentSegments = documentId.split("/");
  const basePath = join(rootDir, locale, ...documentSegments);

  return extensions.map((extension) => ({
    extension,
    path: `${basePath}${extension}`,
  }));
}

export function createMarkdownCollection<
  TTranslator extends AnyBetterTranslateTranslator,
>({
  translator,
  rootDir,
  extensions,
}: MarkdownCollectionConfig<TTranslator>): MarkdownCollection<
  InferLocale<TTranslator>
> {
  const resolvedRootDir = resolve(rootDir);
  const supportedLocales =
    translator.getSupportedLocales() as readonly InferLocale<TTranslator>[];
  const defaultLocale = translator.defaultLocale as InferLocale<TTranslator>;
  const fallbackLocale = translator.fallbackLocale as InferLocale<TTranslator>;
  const resolvedExtensions = normalizeExtensions(extensions);

  const listDocuments: MarkdownCollection<
    InferLocale<TTranslator>
  >["listDocuments"] = async () => {
    const localeDirectory = join(resolvedRootDir, defaultLocale);

    if (!(await pathExists(localeDirectory))) {
      return [];
    }

    const files = await walkDirectory(localeDirectory);
    const documentIds = new Set<string>();

    for (const filePath of files) {
      const extension = resolvedExtensions.find((candidate) =>
        filePath.endsWith(candidate),
      );

      if (!extension) {
        continue;
      }

      const relativePath = relative(localeDirectory, filePath);
      const normalizedPath = relativePath.split("\\").join("/");
      const documentId = normalizedPath.slice(0, -extension.length);

      documentIds.add(documentId);
    }

    return [...documentIds].sort();
  };

  const getDocument: MarkdownCollection<
    InferLocale<TTranslator>
  >["getDocument"] = async (documentId, options) => {
    const normalizedDocumentId = normalizeDocumentId(documentId);
    const requestedLocale = (options?.locale ??
      defaultLocale) as InferLocale<TTranslator>;

    assertSupportedLocale(requestedLocale, supportedLocales);

    const localeSearchOrder =
      requestedLocale === fallbackLocale
        ? [requestedLocale]
        : [requestedLocale, fallbackLocale];
    const lookedUpPaths: string[] = [];

    for (const locale of localeSearchOrder) {
      const candidatePaths = createCandidatePaths(
        resolvedRootDir,
        locale,
        normalizedDocumentId,
        resolvedExtensions,
      );

      for (const candidate of candidatePaths) {
        lookedUpPaths.push(candidate.path);

        if (!(await pathExists(candidate.path))) {
          continue;
        }

        const fileContents = await readFile(candidate.path, "utf8");
        const parsedFile = matter(fileContents);

        return {
          frontmatter: parsedFile.data,
          id: normalizedDocumentId,
          kind: candidate.extension === ".mdx" ? "mdx" : "md",
          locale,
          path: candidate.path,
          requestedLocale,
          source: parsedFile.content,
          usedFallback: locale !== requestedLocale,
        };
      }
    }

    throw new MarkdownDocumentNotFoundError({
      fallbackLocale,
      id: normalizedDocumentId,
      lookedUpPaths,
      requestedLocale,
    });
  };

  async function compileDocument(
    documentId: string,
    options?: MarkdownDocumentOptions<InferLocale<TTranslator>>,
  ): Promise<CompiledMarkdownResult<InferLocale<TTranslator>>>;
  async function compileDocument(
    document: LocalizedMarkdownDocument<InferLocale<TTranslator>>,
  ): Promise<CompiledMarkdownResult<InferLocale<TTranslator>>>;
  async function compileDocument(
    documentOrId: string | LocalizedMarkdownDocument<InferLocale<TTranslator>>,
    options?: MarkdownDocumentOptions<InferLocale<TTranslator>>,
  ): Promise<CompiledMarkdownResult<InferLocale<TTranslator>>> {
    const document =
      typeof documentOrId === "string"
        ? await getDocument(documentOrId, options)
        : documentOrId;

    return compileMarkdownDocument(document);
  }

  return {
    compileDocument,
    getDocument,
    listDocuments,
  };
}

export function createMarkdownHelpers<
  TTranslator extends AnyBetterTranslateTranslator,
>(
  translator: TTranslator,
  options: MarkdownHelpersOptions,
): MarkdownCollection<InferLocale<TTranslator>> {
  return createMarkdownCollection({
    ...options,
    translator,
  });
}
