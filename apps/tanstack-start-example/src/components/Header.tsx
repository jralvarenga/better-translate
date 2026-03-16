import { useParams } from '@tanstack/react-router'
import { I18nLink, useI18nNavigate, useI18nPathname, useLocale } from '#/lib/i18n/navigation'
import { routing } from '#/lib/i18n/routing'

interface HeaderProps {
  guideLabel: string
  homeLabel: string
  loginLabel: string
  switchLabel: string
}

export default function Header({
  guideLabel,
  homeLabel,
  loginLabel,
  switchLabel,
}: HeaderProps) {
  const locale = useLocale()
  const navigate = useI18nNavigate()
  const pathname = useI18nPathname()
  const currentParams = useParams({ strict: false }) as { lang: string }

  return (
    <header className="flex flex-col gap-5 border-b border-black/5 pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <I18nLink
          className="inline-flex items-center gap-3 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-black/[0.03]"
          to="/"
          params={currentParams}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          better-translate
        </I18nLink>

        <nav className="flex flex-wrap gap-3 text-sm font-medium">
          <I18nLink
            className="rounded-full border border-black/10 px-4 py-2 transition-colors hover:bg-black/[0.03]"
            to="/$lang"
            params={currentParams}
          >
            {homeLabel}
          </I18nLink>
          <I18nLink
            className="rounded-full border border-black/10 px-4 py-2 transition-colors hover:bg-black/[0.03]"
            to="/$lang/guide"
            params={currentParams}
          >
            {guideLabel}
          </I18nLink>
          <I18nLink
            className="rounded-full border border-black/10 px-4 py-2 transition-colors hover:bg-black/[0.03]"
            to="/$lang/login"
            params={currentParams}
          >
            {loginLabel}
          </I18nLink>
        </nav>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-zinc-500">{switchLabel}</span>
        {routing.locales.map((nextLocale) => {
          const isActive = nextLocale === locale

          return (
            <button
              key={nextLocale}
              type="button"
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-black/10 text-zinc-600 hover:bg-black/[0.03]'
              }`}
              onClick={() => {
                void navigate({
                  locale: nextLocale,
                  replace: true,
                  to: pathname,
                })
              }}
            >
              {nextLocale.toUpperCase()}
            </button>
          )
        })}
      </div>
    </header>
  )
}
