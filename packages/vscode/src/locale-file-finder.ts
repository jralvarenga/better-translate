import * as vscode from 'vscode';

/**
 * Finds the locale file for the given locale.
 * Resolution order:
 *   1. `localesDirOverride/<locale>.(json|ts|js)` if override is set
 *   2. Auto-detect via glob pattern in workspace
 */
export async function findLocaleFile(
  folders: readonly vscode.WorkspaceFolder[],
  defaultLocale: string,
  localesDirOverride?: string,
): Promise<vscode.Uri | null> {
  const extensions = ['json', 'ts', 'js'];

  if (localesDirOverride) {
    for (const folder of folders) {
      for (const ext of extensions) {
        const candidatePath = vscode.Uri.joinPath(
          folder.uri,
          localesDirOverride,
          `${defaultLocale}.${ext}`,
        );
        try {
          await vscode.workspace.fs.stat(candidatePath);
          return candidatePath;
        } catch {
          // not found, continue
        }
      }
    }
  }

  // Auto-detect
  for (const ext of extensions) {
    const pattern = `**/locales/${defaultLocale}.${ext}`;
    const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**', 1);
    if (files.length > 0) {
      return files[0];
    }
  }

  return null;
}
