import { createFileRoute, notFound } from '@tanstack/react-router'

import { hasLocale } from '@better-translate/tanstack-router'
import { I18nLink } from '#/lib/i18n/navigation'
import { getHomeCopy } from '#/lib/i18n/server'
import { routing } from '#/lib/i18n/routing'

export const Route = createFileRoute('/$lang/')({
  loader: async ({ params }) => {
    if (!hasLocale(routing.locales, params.lang)) {
      throw notFound()
    }

    return getHomeCopy({
      data: {
        locale: params.lang,
      },
    })
  },
  component: HomePage,
})

function HomePage() {
  const copy = Route.useLoaderData()
  const params = Route.useParams()

  return (
    <main className="flex flex-1 flex-col justify-between gap-10 py-10">
      <div className="flex flex-col gap-6">
        <div className="inline-flex w-fit items-center gap-3 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-600">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          {copy.badge}
        </div>

        <div className="space-y-5">
          <h1 className="max-w-3xl text-3xl font-semibold leading-10 tracking-tight sm:text-5xl sm:leading-[1.05]">
            {copy.title}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-zinc-600">
            {copy.description}
          </p>
          <p className="max-w-3xl text-base leading-7 text-zinc-500">
            {copy.supportingCopy}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 text-base font-medium sm:flex-row sm:flex-wrap">
        <I18nLink
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-white transition-colors hover:bg-zinc-700 md:w-[220px]"
          to="/$lang/guide"
          params={params}
        >
          {copy.primaryCta}
        </I18nLink>
        <I18nLink
          className="flex h-12 w-full items-center justify-center rounded-full border border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] md:w-[170px]"
          to="/$lang/login"
          params={params}
        >
          {copy.secondaryCta}
        </I18nLink>
      </div>
    </main>
  )
}
