import { RiShieldCheckLine, RiCodeSSlashLine, RiTranslate2, RiPlugLine } from '@remixicon/react'

const features = [
    {
        icon: RiPlugLine,
        title: 'Framework Agnostic',
        description: 'Zero framework lock-in. One core package, first-class adapters for React, Next.js, TanStack Start, and plain Node.',
    },
    {
        icon: RiShieldCheckLine,
        title: 'Type-Safe by Default',
        description: 'Full TypeScript inference on translation keys and interpolation variables. Typos and missing keys become compile errors.',
    },
    {
        icon: RiCodeSSlashLine,
        title: 'Autocomplete Everywhere',
        description: "Your editor knows every key in your messages object. No more guessing — t(\"home.| triggers completions instantly.",
    },
    {
        icon: RiTranslate2,
        title: 'Locale Switching',
        description: 'Switch locales at runtime without a page reload. Per-call overrides let you render any locale on demand.',
    },
]

export function Features() {
    return (
        <section id="features" className="bg-background py-20 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Built for TypeScript teams</h2>
                    <p className="mt-4 text-muted-foreground">Everything you need for production-grade i18n, nothing you don't.</p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {features.map((f) => (
                        <div key={f.title} className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-6">
                            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand)]/10">
                                <f.icon className="size-4 text-[var(--brand)]" />
                            </div>
                            <div>
                                <h3 className="mb-1 font-medium text-foreground">{f.title}</h3>
                                <p className="text-sm text-muted-foreground">{f.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
