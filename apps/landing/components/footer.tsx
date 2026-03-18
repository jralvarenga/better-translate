import Link from 'next/link'
import { Logo } from '@/components/logo'
import type { LandingLocale, LandingTranslator } from '@/lib/i18n/config'
import { siteLinks } from '@/lib/site'

interface FooterProps {
    locale: LandingLocale
    t: LandingTranslator['t']
}

export function Footer({ locale, t }: FooterProps) {
    return (
        <footer className="border-t border-white/10 py-12">
            <div className="mx-auto max-w-5xl px-6">
                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <Logo />
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <Link href={siteLinks.github} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                            {t('footer.github')}
                        </Link>
                        <Link href={siteLinks.npm} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                            {t('footer.npm')}
                        </Link>
                        <Link href={`/${locale}#docs`} className="hover:text-foreground transition-colors">
                            {t('footer.docs')}
                        </Link>
                    </div>
                </div>
                <p className="mt-10 text-center text-xs text-muted-foreground">
                    {t('footer.legal')}
                </p>
            </div>
        </footer>
    )
}
