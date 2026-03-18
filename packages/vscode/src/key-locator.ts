import * as vscode from "vscode";

/**
 * Finds the position of a dot-notation key in a JSON locale file.
 * E.g. "routes.greeting" → finds `"greeting":` nested inside `"routes":{}`
 */
export function findKeyInJson(
  text: string,
  keyPath: string,
): vscode.Position | null {
  const segments = keyPath.split(".");
  const lines = text.split("\n");

  let depth = 0;
  let segmentIndex = 0;
  let targetDepth = 1;

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];

    // Count brace changes on this line
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;

    const segment = segments[segmentIndex];
    const isLastSegment = segmentIndex === segments.length - 1;

    // Check if this line contains the target key at the expected depth
    // For JSON: "key":
    const keyPattern = new RegExp(`^\\s*"${escapeRegex(segment)}"\\s*:`);
    if (keyPattern.test(line) && depth === targetDepth) {
      if (isLastSegment) {
        const col = line.indexOf(`"${segment}"`);
        return new vscode.Position(lineNum, col >= 0 ? col : 0);
      } else {
        // Move to next segment, increase target depth
        segmentIndex++;
        targetDepth++;
      }
    }

    depth += openBraces - closeBraces;
  }

  return null;
}

/**
 * Finds the position of a dot-notation key in a TypeScript/JavaScript locale file.
 * E.g. "routes.greeting" → finds `greeting:` nested inside `routes: {}`
 * Handles both unquoted and quoted keys, optional `readonly` modifier.
 */
export function findKeyInTypeScript(
  text: string,
  keyPath: string,
): vscode.Position | null {
  const segments = keyPath.split(".");
  const lines = text.split("\n");

  let depth = 0;
  let segmentIndex = 0;
  let targetDepth = 1;

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];

    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;

    const segment = segments[segmentIndex];
    const isLastSegment = segmentIndex === segments.length - 1;

    // Match unquoted keys: `  greeting:` or `  readonly greeting:`
    // Also match quoted keys: `  "greeting":` or `  'greeting':`
    const unquotedPattern = new RegExp(
      `^\\s*(?:readonly\\s+)?${escapeRegex(segment)}\\s*[?:]`,
    );
    const quotedPattern = new RegExp(
      `^\\s*(?:readonly\\s+)?['"]${escapeRegex(segment)}['"]\\s*[?:]`,
    );

    const matches =
      (unquotedPattern.test(line) || quotedPattern.test(line)) &&
      depth === targetDepth;

    if (matches) {
      if (isLastSegment) {
        // Find the column of the key
        let col = line.search(
          new RegExp(`(?:readonly\\s+)?(?:['"])?${escapeRegex(segment)}`),
        );
        if (col < 0) col = 0;
        // Skip leading whitespace to point to the key itself
        const trimmed = line.trimStart();
        col = line.length - trimmed.length;
        // Re-find within trimmed (skip readonly if present)
        const keyInTrimmed = trimmed.search(
          new RegExp(`(?:['"])?${escapeRegex(segment)}`),
        );
        col = col + (keyInTrimmed >= 0 ? keyInTrimmed : 0);
        return new vscode.Position(lineNum, col);
      } else {
        segmentIndex++;
        targetDepth++;
      }
    }

    depth += openBraces - closeBraces;
  }

  return null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
