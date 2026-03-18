import { CopyButton } from "@/components/copy-button";

// Simple regex-based TypeScript syntax highlighter for fixed landing page code blocks.
// No runtime dependencies — pure JSX span rendering.

type Token = { text: string; cls: string; start: number }

const PLAIN = 'text-zinc-300'

const patterns: [RegExp, string][] = [
    [/\/\/[^\n]*/,                                                          'text-zinc-500 italic'],
    [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/,             'text-emerald-400'],
    [/\b(const|await|as|return|import|export|from|default|async)\b/,       'text-purple-400'],
    [/\b[A-Z][a-zA-Z0-9]*\b/,                                              'text-orange-300'],
    [/\b[a-z][a-zA-Z0-9]*(?=\s*\()/,                                       'text-blue-400'],
    [/\b[a-z][a-zA-Z0-9]*(?=\s*:)/,                                        'text-sky-300'],
    [/\b[a-zA-Z][a-zA-Z0-9]*\b/,                                           PLAIN],
]

function tokenize(code: string): Token[] {
    const tokens: Token[] = []
    let i = 0

    while (i < code.length) {
        const start = i
        let matched = false
        for (const [re, cls] of patterns) {
            const m = code.slice(i).match(new RegExp(`^(?:${re.source})`))
            if (m) {
                tokens.push({ text: m[0], cls, start })
                i += m[0].length
                matched = true
                break
            }
        }
        if (!matched) {
            const last = tokens[tokens.length - 1]
            if (last && last.cls === PLAIN && last.start + last.text.length === start) {
                last.text += code[i]
            } else {
                tokens.push({ text: code[i], cls: PLAIN, start })
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
            {tokens.map((t) => (
                <span key={`${t.start}-${t.cls}`} className={t.cls}>{t.text}</span>
            ))}
        </>
    )
}

export function CodeBlock({
    code,
    filename,
    showLineNumbers = false,
}: {
    code: string
    filename?: string
    showLineNumbers?: boolean
}) {
    const lines = code.split('\n')

    return (
        <div className="overflow-hidden rounded-2xl bg-zinc-950">
            {filename && (
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
                    <div className="text-xs text-zinc-500">{filename}</div>
                    <CopyButton
                        text={code}
                        label="Copy code"
                        copiedLabel="Copied"
                        className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition hover:bg-white/10"
                    />
                </div>
            )}
            <pre className="overflow-x-auto p-5 text-xs leading-relaxed sm:text-sm">
                <code className="font-mono">
                    {showLineNumbers ? (
                        <span className="grid min-w-full">
                            {lines.map((line, index) => (
                                <span key={`${index + 1}-${line}`} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
                                    <span className="select-none text-right text-zinc-600">{index + 1}</span>
                                    <span className="min-w-0 whitespace-pre">
                                        <Highlight code={line} />
                                    </span>
                                </span>
                            ))}
                        </span>
                    ) : (
                        <Highlight code={code} />
                    )}
                </code>
            </pre>
        </div>
    )
}
