import { createFileRoute, notFound } from "@tanstack/react-router";

import { hasLocale } from "@better-translate/tanstack-router";
import { I18nLink } from "#/lib/i18n/navigation";
import { getGuideCopy } from "#/lib/i18n/server";
import { routing } from "#/lib/i18n/routing";

export const Route = createFileRoute("/$lang/guide")({
  loader: async ({ params }) => {
    if (!hasLocale(routing.locales, params.lang)) {
      throw notFound();
    }

    return getGuideCopy({
      data: {
        locale: params.lang,
      },
    });
  },
  component: GuidePage,
});

function GuidePage() {
  const copy = Route.useLoaderData();
  const params = Route.useParams();

  return (
    <main className="flex flex-1 flex-col justify-between gap-10 py-10">
      <div className="flex flex-col gap-6">
        <div className="inline-flex w-fit items-center gap-3 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-600">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
          {copy.badge}
        </div>

        <div className="space-y-5">
          <h1 className="max-w-3xl text-3xl font-semibold leading-10 tracking-tight sm:text-5xl sm:leading-[1.05]">
            {copy.title}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-zinc-600">
            {copy.description}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-[1.5rem] border border-black/5 bg-zinc-50 p-6">
              <h2 className="text-lg font-semibold">{copy.routeTreeTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                {copy.routeTreeDescription}
              </p>
            </article>
            <article className="rounded-[1.5rem] border border-black/5 bg-zinc-50 p-6">
              <h2 className="text-lg font-semibold">{copy.navigationTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                {copy.navigationDescription}
              </p>
            </article>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 text-base font-medium sm:flex-row sm:flex-wrap">
        <I18nLink
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-white transition-colors hover:bg-zinc-700 md:w-[180px]"
          to="/$lang"
          params={params}
        >
          {copy.backToHome}
        </I18nLink>
        <I18nLink
          className="flex h-12 w-full items-center justify-center rounded-full border border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] md:w-[180px]"
          to="/$lang/login"
          params={params}
        >
          {copy.openLogin}
        </I18nLink>
      </div>
    </main>
  );
}
