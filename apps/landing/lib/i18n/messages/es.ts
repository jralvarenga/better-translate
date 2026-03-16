export const es = {
  codeDemo: {
    description: "Configura una vez y crea helpers tipados en cualquier lugar.",
    title: "API simple de dos pasos",
  },
  features: {
    description:
      "Todo lo que necesitas para i18n en produccion, sin complejidad innecesaria.",
    items: {
      autocomplete: {
        description:
          'Tu editor conoce cada clave del objeto de mensajes. Ya no adivinas porque `t("home.` empieza a autocompletar al instante.',
        title: "Autocompletado en todas partes",
      },
      frameworkAgnostic: {
        description:
          "Cero bloqueo por framework. Un solo paquete core con adaptadores de primera clase para React, Next.js, TanStack Start y Node.",
        title: "Agnostico al framework",
      },
      localeSwitching: {
        description:
          "Cambia de idioma en tiempo real sin recargar la pagina. Tambien puedes renderizar cualquier locale por llamada.",
        title: "Cambio de locale",
      },
      typeSafe: {
        description:
          "Inferencia completa de TypeScript para claves de traduccion y variables de interpolacion. Los errores y claves faltantes fallan en compilacion.",
        title: "Type-safe por defecto",
      },
    },
    title: "Hecho para equipos TypeScript",
  },
  footer: {
    docs: "Docs",
    github: "GitHub",
    legal: "Licencia MIT · hecho con TypeScript",
    npm: "npm",
  },
  frameworks: {
    description:
      "Un mismo core de traducciones. Adaptadores nativos para los frameworks principales de TypeScript, o usa el core directamente.",
    heroDescription:
      "Sin bloqueo por framework - un solo core y cero dependencias de runtime",
    heroTitle: "Funciona con cualquier proyecto TypeScript",
    items: {
      bun: {
        description: "Soporte nativo para Bun sin configuracion adicional.",
      },
      nextjs: {
        description:
          "Server Components, App Router y helpers de locale integrados a la ruta.",
      },
      nodejs: {
        description:
          "Core sin dependencias para scripts, servidores y procesos en segundo plano.",
      },
      react: {
        description:
          "Contexto, hooks y renderizado con locale para componentes cliente en React.",
      },
      tanstack: {
        description:
          "Soporte de ruteo type-safe para proyectos con TanStack Start y Router.",
      },
      typescript: {
        description:
          "Tipos fuertes, autocompletado y feedback en compilacion desde tus mensajes.",
      },
    },
    title: "Tu framework, tu decision",
  },
  header: {
    changelog: "Changelog",
    cli: "CLI",
    closeMenu: "Cerrar menu",
    docs: "Docs",
    github: "GitHub",
    language: "Idioma",
    languageSwitcher: "Cambiar idioma",
    openMenu: "Abrir menu",
  },
  hero: {
    badge: "Agnostico al framework - funciona en cualquier proyecto TypeScript",
    description:
      "Define tus traducciones una sola vez. Obten autocompletado, errores de tipos y cambio de locale sin bloqueo por framework. Funciona en cualquier codebase TypeScript.",
    primaryCta: "Ver docs",
    secondaryCta: "Ver en GitHub",
    title: "Traducciones type-safe para TypeScript",
  },
} as const;
