export const en = {
  guide: {
    backToHome: "Back to home",
    openLogin: "Open login page",
    badge: "Localized route detail",
    description:
      "This second page shows that guide routes, links, and the locale switcher all stay inside the active language at the root of the app.",
    navigationDescription:
      "The app injects TanStack Router primitives into createNavigationFunctions(), so locale-aware links and router calls stay compatible with the installed router version.",
    navigationTitle: "Injected navigation",
    routeTreeDescription:
      "Every user-facing page now lives under the optional locale segment, so home, guide, and login all share the same locale-aware routing model.",
    routeTreeTitle: "Optional locale route tree",
    title: "One route tree, two languages, and a localized app from the root.",
  },
  home: {
    badge: "Root-level localized experience",
    description:
      "This page keeps the same calm starter-card feel, but now the full route tree is localized from the root with TanStack Router optional path params.",
    primaryCta: "See localized guide",
    secondaryCta: "Open localized login",
    supportingCopy:
      "Switch between English and Spanish from the header above. The current route shape stays intact, while Better Translate keeps links and router navigation locale-aware.",
    title:
      "Locale routing that starts at the root and feels native to TanStack Start.",
  },
  login: {
    badge: "Localized login route",
    description:
      "Login now belongs to the same optional-locale tree as the rest of the example, so the route, header navigation, and switcher all stay consistent.",
    primaryCta: "Back to home",
    secondaryCta: "Open guide",
    title: "A localized login page without leaving the app shell.",
  },
  navigation: {
    guide: "Guide",
    home: "Home",
    login: "Login",
    switchLanguage: "Language",
  },
} as const;
