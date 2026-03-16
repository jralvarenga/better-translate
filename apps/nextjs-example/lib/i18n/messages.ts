export const en = {
  guide: {
    backToDemo: "Back to localized demo",
    backToGateway: "Back to gateway",
    badge: "Localized route detail",
    description:
      "This second localized route proves that internal links stay inside the active locale unless you intentionally switch languages.",
    navigationDescription:
      "The app injects Next.js navigation primitives into createNavigationFunctions(), so locale-aware links and router calls stay compatible with the installed Next.js version.",
    navigationTitle: "Injected navigation",
    scopeDescription:
      "Only /app/[lang] is localized. Routes like / and /login remain normal, out-of-scope Next.js pages.",
    scopeTitle: "Scoped by routeTemplate",
    title: "One route tree, two languages, zero global takeover.",
  },
  home: {
    badge: "Localized starter experience",
    description:
      "This page keeps the familiar calm starter-card feel, but the copy, internal links, and top-header switcher now come from Better Translate.",
    gatewayCta: "Back to gateway",
    primaryCta: "See localized guide",
    secondaryCta: "Open login route",
    supportingCopy:
      "Switch between English and Spanish from the header above. The layout stays smooth, while / and /login remain intentionally outside the i18n scope.",
    title: "Scoped locale routing that feels native to the app.",
  },
  navigation: {
    gateway: "Gateway",
    guide: "Guide",
    localizedHome: "Demo home",
    login: "Login",
    switchLanguage: "Language",
  },
} as const;

export const es = {
  guide: {
    backToDemo: "Volver al demo localizado",
    backToGateway: "Volver a la portada",
    badge: "Detalle de ruta localizada",
    description:
      "Esta segunda ruta localizada demuestra que los enlaces internos permanecen dentro del idioma activo, a menos que cambies el idioma de forma intencional.",
    navigationDescription:
      "La app inyecta las primitivas de navegacion de Next.js en createNavigationFunctions(), para que los enlaces y router localizados sigan siendo compatibles con la version instalada de Next.js.",
    navigationTitle: "Navegacion inyectada",
    scopeDescription:
      "Solo /app/[lang] esta localizado. Rutas como / y /login siguen siendo paginas normales de Next.js fuera del alcance del i18n.",
    scopeTitle: "Limitado por routeTemplate",
    title: "Un arbol de rutas, dos idiomas y cero takeover global.",
  },
  home: {
    badge: "Experiencia starter localizada",
    description:
      "Esta pagina mantiene la sensacion calmada de la tarjeta inicial, pero el texto, los enlaces internos y el selector del header superior ahora vienen de Better Translate.",
    gatewayCta: "Volver a la portada",
    primaryCta: "Ver guia localizada",
    secondaryCta: "Abrir ruta de login",
    supportingCopy:
      "Cambia entre ingles y espanol desde el header superior. El layout se mantiene fluido, mientras / y /login siguen intencionalmente fuera del alcance del i18n.",
    title: "Rutas localizadas por alcance que se sienten nativas en la app.",
  },
  navigation: {
    gateway: "Portada",
    guide: "Guia",
    localizedHome: "Inicio demo",
    login: "Login",
    switchLanguage: "Idioma",
  },
} as const;
