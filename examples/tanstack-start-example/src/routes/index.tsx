import { createFileRoute, redirect } from '@tanstack/react-router'

import { routing } from '#/lib/i18n/routing'

export const Route = createFileRoute('/')({
  beforeLoad() {
    throw redirect({ to: '/$lang', params: { lang: routing.defaultLocale } })
  },
})
