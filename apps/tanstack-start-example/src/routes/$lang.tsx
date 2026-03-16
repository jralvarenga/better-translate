import { Outlet, createFileRoute, notFound } from '@tanstack/react-router'

import Header from '#/components/Header'
import { getChromeCopy } from '#/lib/i18n/server'
import { routing } from '#/lib/i18n/routing'
import { hasLocale } from '@better-translate/tanstack-router'

export const Route = createFileRoute('/$lang')({
  beforeLoad({ params }) {
    if (!hasLocale(routing.locales, params.lang)) {
      throw notFound()
    }
  },
  loader: async ({ params }) => {
    if (!hasLocale(routing.locales, params.lang)) {
      throw notFound()
    }

    return getChromeCopy({
      data: {
        locale: params.lang,
      },
    })
  },
  component: LocalizedLayout,
})

function LocalizedLayout() {
  const loaderData = Route.useLoaderData()

  return (
    <div
      className="min-h-screen bg-zinc-50 px-6 py-8 font-sans text-zinc-950"
      lang={loaderData.locale}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col rounded-[2rem] border border-black/5 bg-white px-8 py-8 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] sm:px-10 sm:py-10">
        <Header
          guideLabel={loaderData.guideLabel}
          homeLabel={loaderData.homeLabel}
          loginLabel={loaderData.loginLabel}
          switchLabel={loaderData.switchLabel}
        />
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
