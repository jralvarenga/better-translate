// Simple regex-based TypeScript syntax highlighter for fixed landing page code blocks.
// No runtime dependencies — pure JSX span rendering.

type Token = { text: string; cls: string }

const PLAIN = 'text-zinc-300'

const patterns: [RegExp, string][] = [
    [/\/\/[^\n]*/,                                                          'text-zinc-500 italic'],
    [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/,             'text-emerald-400'],
    [/\b(const|await|as|return|import|export|from|default|async)\b/,       'text-purple-400'],
    [/\b[A-Z][a-zA-Z0-9]*\b/,                                              'text-orange-300'],
    [/\b[a-z][a-zA-Z0-9]*(?=\s*\()/,                                       'text-blue-400'],
    [/\b[a-z][a-zA-Z0-9]*(?=\s*:)/,                                        'text-sky-300'],
]

function tokenize(code: string): Token[] {
    const tokens: Token[] = []
    let i = 0

    while (i < code.length) {
        let matched = false
        for (const [re, cls] of patterns) {
            const m = code.slice(i).match(new RegExp(`^(?:${re.source})`))
            if (m) {
                tokens.push({ text: m[0], cls })
                i += m[0].length
                matched = true
                break
            }
        }
        if (!matched) {
            const last = tokens[tokens.length - 1]
            if (last && last.cls === PLAIN) {
                last.text += code[i]
            } else {
                tokens.push({ text: code[i], cls: PLAIN })
            }
            i++
        }
    }

    return tokens
}

export function Highlight({ code }: { code: string }) {
    const tokens = tokenize(code)
    return (
        <>
            {tokens.map((t, i) => (
                <span key={i} className={t.cls}>{t.text}</span>
            ))}
        </>
    )
}

export function CodeBlock({ code, filename }: { code: string; filename?: string }) {
    return (
        <div className="overflow-hidden rounded-2xl bg-zinc-950">
            {filename && (
                <div className="border-b border-white/10 px-4 py-2 text-xs text-zinc-500">{filename}</div>
            )}
            <pre className="overflow-x-auto p-5 text-xs leading-relaxed sm:text-sm">
                <code className="font-mono">
                    <Highlight code={code} />
                </code>
            </pre>
        </div>
    )
}
