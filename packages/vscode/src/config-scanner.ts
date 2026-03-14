import * as vscode from 'vscode';
import * as path from 'path';

export interface TranslationConfig {
  defaultLocale: string;
}

let cache: TranslationConfig | null | undefined = undefined;

/**
 * Scans workspace files for a static default/fallback locale string.
 * Resolution order:
 *   1. `fallbackLocale: "en"` or `defaultLocale: "en"` inline in configureTranslations
 *   2. `FALLBACK_LOCALE = "en"` or `DEFAULT_LOCALE = "en"` constant patterns
 * Returns null when locale is only available as a variable reference.
 */
export async function scanForTranslationConfig(
  folders: readonly vscode.WorkspaceFolder[],
): Promise<TranslationConfig | null> {
  if (cache !== undefined) {
    return cache;
  }

  for (const folder of folders) {
    const result = await scanFolder(folder);
    if (result) {
      cache = result;
      return cache;
    }
  }

  cache = null;
  return null;
}

export function invalidateConfigCache(): void {
  cache = undefined;
}

async function scanFolder(folder: vscode.WorkspaceFolder): Promise<TranslationConfig | null> {
  const files = await vscode.workspace.findFiles(
    new vscode.RelativePattern(folder, '**/*.{ts,js}'),
    '**/node_modules/**',
  );

  // Prioritize files that contain configureTranslations
  const configFiles: vscode.Uri[] = [];
  const otherFiles: vscode.Uri[] = [];

  for (const file of files) {
    const text = await readFile(file);
    if (text === null) continue;
    if (text.includes('configureTranslations')) {
      configFiles.push(file);
    } else {
      otherFiles.push(file);
    }
  }

  // 1. Try inline literal in configureTranslations call
  for (const file of configFiles) {
    const text = await readFile(file);
    if (text === null) continue;

    const inlineMatch =
      text.match(/(?:fallbackLocale|defaultLocale)\s*:\s*['"]([a-zA-Z][a-zA-Z0-9-]*)['"]/) ||
      text.match(/['"]([a-zA-Z][a-zA-Z0-9-]*)['"].*(?:fallback|default).*locale/i);

    if (inlineMatch) {
      return { defaultLocale: inlineMatch[1] };
    }

    // 2. Try constant pattern in same file
    const constantResult = findConstantLocale(text);
    if (constantResult) {
      return constantResult;
    }
  }

  // 3. Try constant patterns in other files
  for (const file of [...configFiles, ...otherFiles]) {
    const text = await readFile(file);
    if (text === null) continue;
    const constantResult = findConstantLocale(text);
    if (constantResult) {
      return constantResult;
    }
  }

  return null;
}

function findConstantLocale(text: string): TranslationConfig | null {
  // Match patterns like: FALLBACK_LOCALE = "en", DEFAULT_LOCALE = 'en', fallbackLocale = "en"
  const patterns = [
    /(?:FALLBACK_LOCALE|DEFAULT_LOCALE|fallbackLocale|defaultLocale)\s*=\s*['"]([a-zA-Z][a-zA-Z0-9-]*)['"](?:\s+as\s+const)?/,
    /const\s+\w*(?:[Ll]ocale|LOCALE)\w*\s*=\s*['"]([a-zA-Z][a-zA-Z0-9-]*)['"](?:\s+as\s+const)?/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return { defaultLocale: match[1] };
    }
  }

  return null;
}

async function readFile(uri: vscode.Uri): Promise<string | null> {
  try {
    const bytes = await vscode.workspace.fs.readFile(uri);
    return Buffer.from(bytes).toString('utf-8');
  } catch {
    return null;
  }
}
