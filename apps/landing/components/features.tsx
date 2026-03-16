import { RiShieldCheckLine, RiCodeSSlashLine, RiTranslate2, RiPlugLine } from '@remixicon/react'
import type { LandingTranslator } from '@/lib/i18n/config'

const features = [
    {
        icon: RiPlugLine,
        descriptionKey: 'features.items.frameworkAgnostic.description',
        titleKey: 'features.items.frameworkAgnostic.title',
    },
    {
        icon: RiShieldCheckLine,
        descriptionKey: 'features.items.typeSafe.description',
        titleKey: 'features.items.typeSafe.title',
    },
    {
        icon: RiCodeSSlashLine,
        descriptionKey: 'features.items.autocomplete.description',
        titleKey: 'features.items.autocomplete.title',
    },
    {
        icon: RiTranslate2,
        descriptionKey: 'features.items.localeSwitching.description',
        titleKey: 'features.items.localeSwitching.title',
    },
] as const

interface FeaturesProps {
    t: LandingTranslator['t']
}

export function Features({ t }: FeaturesProps) {
    return (
        <section id="features" className="bg-background py-20 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{t('features.title')}</h2>
                    <p className="mt-4 text-muted-foreground">{t('features.description')}</p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {features.map((f) => (
                        <div key={f.titleKey} className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-6">
                            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand)]/10">
                                <f.icon className="size-4 text-[var(--brand)]" />
                            </div>
                            <div>
                                <h3 className="mb-1 font-medium text-foreground">{t(f.titleKey)}</h3>
                                <p className="text-sm text-muted-foreground">{t(f.descriptionKey)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
