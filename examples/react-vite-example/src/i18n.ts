import { configureTranslations } from "better-translate/core";

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const en = {
  common: {
    hello: "Hello",
    greeting: "Good morning {name}",
    formalGreeting: "{salute} {name}",
  },
  account: {
    balance: {
      label: "Balance",
    },
  },
  demo: {
    title: "Better Translate React example",
    summary:
      "A Vite app that demonstrates locale switching, async loading, and typed interpolation.",
    currentLocale: "Current locale",
    defaultLocale: "Default locale",
    fallbackLocale: "Fallback locale",
    loadingLocale: "Loading locale",
    localeReady: "Idle",
    cachedLocales: "Cached locales",
    switcherTitle: "Locale switcher",
    switcherCopy:
      "Preloaded English and Spanish switch instantly. French is loaded on demand before the app moves into that locale.",
    greetingTitle: "Typed interpolation",
    greetingCopy:
      "This sentence is assembled through the locale-bound t() helper and keeps params typed from the message template.",
    greetingOutput: "Preview",
    messageCacheTitle: "Cached messages",
    messageCacheCopy:
      "loadLocale() warms the cache without changing the active locale, so the next switch is instant.",
    asyncReady: "French cache ready",
    asyncPending: "Fetching French messages...",
    asyncAction: "Load French cache",
    failureTitle: "Isolated failure state",
    failureCopy:
      "A second provider demonstrates load failures without disrupting the primary happy path demo.",
    failureAction: "Try failing French locale",
    failureIdle: "No error triggered yet.",
    failureCurrentLocale: "Sandbox locale",
    failureErrorLabel: "Sandbox error",
  },
  fields: {
    salute: "Salute",
    name: "Name",
  },
  actions: {
    switchToEnglish: "Switch to English",
    switchToSpanish: "Switch to Spanish",
    switchToFrench: "Switch to French",
  },
  errors: {
    localeFailedToLoad: "Locale failed to load",
  },
} as const;

export const es = {
  common: {
    hello: "Hola",
    greeting: "Buenos dias {name}",
    formalGreeting: "{salute} {name}",
  },
  account: {
    balance: {
      label: "Saldo",
    },
  },
  demo: {
    title: "Ejemplo React de Better Translate",
    summary:
      "Una app de Vite que demuestra cambio de idioma, carga asíncrona e interpolación tipada.",
    currentLocale: "Idioma actual",
    defaultLocale: "Idioma por defecto",
    fallbackLocale: "Idioma de respaldo",
    loadingLocale: "Idioma cargando",
    localeReady: "En espera",
    cachedLocales: "Idiomas en caché",
    switcherTitle: "Selector de idioma",
    switcherCopy:
      "Ingles y espanol cambian al instante. Frances se carga bajo demanda antes de cambiar la app.",
    greetingTitle: "Interpolacion tipada",
    greetingCopy:
      "Esta frase se arma con el helper t() ligado al locale y mantiene los params tipados desde la plantilla.",
    greetingOutput: "Vista previa",
    messageCacheTitle: "Mensajes en caché",
    messageCacheCopy:
      "loadLocale() precalienta la caché sin cambiar el locale activo, asi el siguiente cambio es inmediato.",
    asyncReady: "Cache de frances lista",
    asyncPending: "Cargando mensajes en frances...",
    asyncAction: "Cargar cache de frances",
    failureTitle: "Fallo aislado",
    failureCopy:
      "Un segundo provider demuestra errores de carga sin romper el flujo feliz principal.",
    failureAction: "Probar error de frances",
    failureIdle: "Todavia no se ha disparado ningun error.",
    failureCurrentLocale: "Locale del sandbox",
    failureErrorLabel: "Error del sandbox",
  },
  fields: {
    salute: "Saludo",
    name: "Nombre",
  },
  actions: {
    switchToEnglish: "Cambiar a ingles",
    switchToSpanish: "Cambiar a espanol",
    switchToFrench: "Cambiar a frances",
  },
  errors: {
    localeFailedToLoad: "No se pudo cargar el locale",
  },
} as const;

const fr = {
  common: {
    hello: "Bonjour",
  },
  account: {
    balance: {
      label: "Solde",
    },
  },
} as const;

export function createTranslator() {
  return configureTranslations({
    availableLocales: ["en", "es", "fr"] as const,
    defaultLocale: "en",
    fallbackLocale: "en",
    messages: { en, es },
    loaders: {
      fr: async () => {
        await wait(50);
        return fr;
      },
    },
  });
}

export function createFailingTranslator() {
  return configureTranslations({
    availableLocales: ["en", "fr"] as const,
    defaultLocale: "en",
    fallbackLocale: "en",
    messages: { en },
    loaders: {
      fr: async () => {
        await wait(25);
        throw new Error(en.errors.localeFailedToLoad);
      },
    },
  });
}

export type AppTranslator = Awaited<ReturnType<typeof createTranslator>>;
export type FailureTranslator = Awaited<ReturnType<typeof createFailingTranslator>>;
