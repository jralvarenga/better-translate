/**
 * Extracts a translation key from a line of text at a given cursor position.
 * Handles `t("key")`, `t('key')`, `translator.t("key")`, multiple calls per line.
 * Returns null for template literals, dynamic keys, or non-key positions.
 */
export function extractKeyAtPosition(
  lineText: string,
  character: number,
  functionNames: string[] = ['t'],
): { key: string } | null {
  // Build a regex that matches any of the function names (with optional method prefix)
  // e.g. t("key"), translator.t("key")
  const fnPattern = functionNames.map(fn => `(?:[A-Za-z_$][\\w$]*\\.)?${escapeRegex(fn)}`).join('|');
  const callRegex = new RegExp(`(?:${fnPattern})\\s*\\(\\s*(['"])([^'"\\\\]*(\\\\.[^'"\\\\]*)*)\\1`, 'g');

  let match: RegExpExecArray | null;
  while ((match = callRegex.exec(lineText)) !== null) {
    const quoteChar = match[1];
    const key = match[2];

    // Find the position of the key string content within the line
    // match.index is the start of the function call
    // We need the index of the opening quote
    const callStart = match.index;
    const fullMatch = match[0];
    const quoteIndex = callStart + fullMatch.lastIndexOf(quoteChar, fullMatch.length - key.length - 1);
    const keyStart = quoteIndex + 1;
    const keyEnd = keyStart + key.length;

    if (character >= keyStart && character <= keyEnd) {
      // Unescape any escaped characters in the key
      const unescaped = key.replace(/\\(.)/g, '$1');
      return { key: unescaped };
    }
  }

  return null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
