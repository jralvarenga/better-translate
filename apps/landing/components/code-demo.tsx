import { CodeBlock } from '@/components/ui/code-highlight'
import type { LandingTranslator } from '@/lib/i18n/config'

const code = `export const landingTranslationsConfig = {
  availableLocales: ["en", "es"] as const,
  defaultLocale: "en",
  fallbackLocale: "en",
  messages: { en, es },
} as const;

const translator = await configureTranslations(landingTranslationsConfig);
const { t } = createTranslationHelpers(translator);

t("hero.title")
t("hero.description")
t("header.language", { locale: "es" })`

interface CodeDemoProps {
    t: LandingTranslator['t']
}

export function CodeDemo({ t }: CodeDemoProps) {
    return (
        <section id="docs" className="bg-background py-20 md:py-32">
            <div className="mx-auto max-w-4xl px-6">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{t('codeDemo.title')}</h2>
                    <p className="mt-4 text-muted-foreground">{t('codeDemo.description')}</p>
                </div>
                <div className="rounded-2xl border border-white/10 p-px">
                    <CodeBlock filename="translate.ts" code={code} />
                </div>
            </div>
        </section>
    )
}
