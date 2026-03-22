import type { TranslationMessages } from "@better-translate/core";

const MESSAGE_SYSTEM_INSTRUCTIONS = [
  "You are translating application locale files.",
  "Mimic the source file's structure, tone, and formatting conventions.",
  "Do not switch styles, rename concepts, regroup content, or invent missing text.",
  "Return only structured output that preserves the exact object shape and every placeholder token.",
].join(" ");

const MESSAGE_RULES = [
  "- Keep the exact same keys and nested structure.",
  "- Mimic the source file's wording style, punctuation style, capitalization style, and sentence density.",
  "- Preserve placeholders like {name}, {count}, and similar tokens exactly.",
  "- Preserve URLs, code identifiers, product names, and formatting markers unless they are natural-language text.",
  "- Do not add explanations, comments, metadata, or extra keys.",
  "- Do not simplify, reorganize, or normalize the content. Stay as close as possible to the source file's format.",
].join("\n");

const MARKDOWN_SYSTEM_INSTRUCTIONS = [
  "You are translating Markdown and MDX documents.",
  "Mimic the source document's structure, formatting, and writing style.",
  "Do not switch layouts, reorder sections, or alter code fences, JSX tags, links, or formatting markers.",
].join(" ");

const MARKDOWN_RULES = [
  "- Preserve headings, lists, emphasis markers, tables, code fences, inline code, HTML, JSX, and MDX tags.",
  "- Preserve links, image URLs, import paths, filenames, and code snippets.",
  "- Translate prose and string frontmatter values only.",
  "- Keep the same section order, spacing intent, and formatting pattern as the source document.",
  "- Do not add commentary, summaries, or extra sections.",
].join("\n");

export function createMessagesPrompt(options: {
  keyPaths: readonly string[];
  sourceLocale: string;
  sourceMessages: TranslationMessages;
  sourceText: string;
  sourcePath: string;
  targetLocale: string;
}): {
  prompt: string;
  system: string;
} {
  const prompt = [
    `Translate the source locale file into "${options.targetLocale}".`,
    `Source locale: ${options.sourceLocale}`,
    `Target locale: ${options.targetLocale}`,
    `Source file: ${options.sourcePath}`,
    "",
    "Rules:",
    MESSAGE_RULES,
    "",
    "Key paths:",
    options.keyPaths.map((key) => `- ${key}`).join("\n"),
    "",
    "Source file content to mimic:",
    options.sourceText,
    "",
    "Source messages:",
    JSON.stringify(options.sourceMessages, null, 2),
  ].join("\n");

  return {
    prompt,
    system: MESSAGE_SYSTEM_INSTRUCTIONS,
  };
}

export function createMarkdownPrompt(options: {
  body: string;
  frontmatterStrings: Record<string, unknown>;
  relativePath: string;
  sourceLocale: string;
  sourceText: string;
  targetLocale: string;
}): {
  prompt: string;
  system: string;
} {
  const prompt = [
    `Translate this markdown document into "${options.targetLocale}".`,
    `Source locale: ${options.sourceLocale}`,
    `Target locale: ${options.targetLocale}`,
    `Document path: ${options.relativePath}`,
    "",
    "Rules:",
    MARKDOWN_RULES,
    "",
    "Source file content to mimic:",
    options.sourceText,
    "",
    "Frontmatter string values:",
    JSON.stringify(options.frontmatterStrings, null, 2),
    "",
    "Markdown body:",
    options.body,
  ].join("\n");

  return {
    prompt,
    system: MARKDOWN_SYSTEM_INSTRUCTIONS,
  };
}
