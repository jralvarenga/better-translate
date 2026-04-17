import { readdir } from "node:fs/promises";
import path from "node:path";

import ts from "typescript";

const SOURCE_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);

const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
]);

export async function collectSourceFiles(
  directory: string,
  ignoredPaths: ReadonlySet<string>,
): Promise<string[]> {
  const entries = (
    await readdir(directory, {
      withFileTypes: true,
    })
  ).sort((a, b) => a.name.localeCompare(b.name));
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (ignoredPaths.has(entryPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        continue;
      }

      files.push(...(await collectSourceFiles(entryPath, ignoredPaths)));
      continue;
    }

    if (
      SOURCE_EXTENSIONS.has(path.extname(entry.name)) &&
      !entry.name.endsWith(".d.ts")
    ) {
      files.push(entryPath);
    }
  }

  return files;
}

export function createScriptKind(sourcePath: string): ts.ScriptKind {
  const extension = path.extname(sourcePath);

  switch (extension) {
    case ".js":
    case ".cjs":
    case ".mjs":
      return ts.ScriptKind.JS;
    case ".jsx":
      return ts.ScriptKind.JSX;
    case ".tsx":
      return ts.ScriptKind.TSX;
    default:
      return ts.ScriptKind.TS;
  }
}

export function createWarning(
  sourceFile: ts.SourceFile,
  node: ts.Node,
  message: string,
): string {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  return `${sourceFile.fileName}:${position.line + 1}: ${message}`;
}

export function isTranslationCall(node: ts.CallExpression): boolean {
  const callee = node.expression;
  const isIdentifierCall = ts.isIdentifier(callee) && callee.text === "t";
  const isPropertyCall =
    ts.isPropertyAccessExpression(callee) && callee.name.text === "t";

  return isIdentifierCall || isPropertyCall;
}

export function getStaticStringValue(node: ts.Expression): string | null {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  if (ts.isParenthesizedExpression(node)) {
    return getStaticStringValue(node.expression);
  }

  if (
    ts.isBinaryExpression(node) &&
    node.operatorToken.kind === ts.SyntaxKind.PlusToken
  ) {
    const left = getStaticStringValue(node.left);
    const right = getStaticStringValue(node.right);

    if (left !== null && right !== null) {
      return `${left}${right}`;
    }
  }

  return null;
}

export function getDynamicStringPrefix(node: ts.Expression): string | null {
  if (ts.isParenthesizedExpression(node)) {
    return getDynamicStringPrefix(node.expression);
  }

  if (ts.isTemplateExpression(node)) {
    return node.head.text || null;
  }

  if (
    ts.isBinaryExpression(node) &&
    node.operatorToken.kind === ts.SyntaxKind.PlusToken
  ) {
    const leftStatic = getStaticStringValue(node.left);

    if (leftStatic !== null) {
      const rightPrefix = getDynamicStringPrefix(node.right);
      return rightPrefix ? `${leftStatic}${rightPrefix}` : leftStatic || null;
    }

    return getDynamicStringPrefix(node.left);
  }

  return null;
}
