import { getRequestConfig } from '@better-translate/tanstack-router/server'
import { configureTranslations } from '@better-translate/core'

import { en } from './messages/en'
import { es } from './messages/es'
import { routing } from './routing'

export const requestConfig = getRequestConfig(async () => ({
  translator: await configureTranslations({
    availableLocales: routing.locales,
    defaultLocale: routing.defaultLocale,
    fallbackLocale: routing.defaultLocale,
    messages: {
      en,
      es,
    },
  }),
}))
