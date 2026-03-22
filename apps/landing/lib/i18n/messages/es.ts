export const es = {
  "codeDemo": {
    "description": "La misma config funciona igual en Next.js, Astro, React o Node puro.",
    "title": "Una API. Cada entorno"
  },
  "features": {
    "description": "La misma configuración, la misma API, la misma experiencia ,  sin importar en qué entorno TypeScript estés.",
    "items": {
      "autocomplete": {
        "description": "Tu editor conoce cada clave en tu objeto de mensajes. Ya no tendrás que adivinar, porque `t(\"home.` empieza a completarse de inmediato.",
        "title": "Autocompletado en todas partes"
      },
      "frameworkAgnostic": {
        "description": "Escribe tu config de traducciones una vez. Funciona igual en Next.js, Astro, React, TanStack Router y Node puro. Cambia de entorno, conserva tu configuración.",
        "title": "La misma config, cada entorno"
      },
      "localeSwitching": {
        "description": "Cambia locales en tiempo de ejecución sin recargar la página. Sobrescrituras por llamada te permiten renderizar cualquier locale a demanda.",
        "title": "Conmutación de locale"
      },
      "typeSafe": {
        "description": "Inferencia completa de TypeScript sobre claves de traducción y variables de interpolación. Errores tipográficos y claves faltantes se vuelven errores de compilación.",
        "title": "Tipado seguro por defecto"
      }
    },
    "title": "La misma configuración. Cada entorno"
  },
  "footer": {
    "docs": "Documentación",
    "github": "GitHub",
    "legal": "Licencia MIT · construido con TypeScript",
    "npm": "npm"
  },
  "frameworks": {
    "description": "Tu config de traducciones funciona igual en cada entorno TypeScript. Adaptadores nativos, API idéntica.",
    "heroDescription": "Cambia de framework sin reescribir tu configuración i18n",
    "heroTitle": "La misma config en todos lados",
    "items": {
      "astro": {
        "description": "Ayudantes por solicitud y Astro content collections localizadas para .md y .mdx."
      },
      "bun": {
        "description": "Soporte nativo del runtime Bun con cero configuración adicional."
      },
      "nextjs": {
        "description": "Componentes del servidor, App Router y ayudantes de locale sensibles a la ruta."
      },
      "nodejs": {
        "description": "Núcleo sin dependencias para scripts, servidores y trabajos en segundo plano."
      },
      "react": {
        "description": "Contexto, hooks y renderizado del cliente sensible a la localización para aplicaciones React."
      },
      "tanstack": {
        "description": "Soporte de enrutamiento tipado para proyectos TanStack Router, incluyendo TanStack Start apps."
      },
      "typescript": {
        "description": "Tipos fuertes, autocompletado y retroalimentación en tiempo de compilación desde tus mensajes."
      }
    },
    "title": "Tu framework, tu elección"
  },
  "header": {
    "changelog": "Changelog",
    "cli": "CLI",
    "closeMenu": "Cerrar menú",
    "docs": "Documentación",
    "github": "GitHub",
    "language": "Idioma",
    "languageSwitcher": "Cambiar idioma",
    "openMenu": "Abrir menú"
  },
  "hero": {
    "badge": "La misma config. Cada entorno TypeScript",
    "description": "Misma config. Misma API. Funciona en Next.js, Astro, React, TanStack Router y Node puro. Sin reescrituras.",
    "primaryCta": "Ver documentación",
    "secondaryCta": "Ver en GitHub",
    "title": "Una configuración i18n para cualquier proyecto TypeScript"
  },
  "docs": {
    "copyMarkdown": "Copiar markdown",
    "copiedMarkdown": "Copiado",
    "header": {
      "home": "Inicio",
      "github": "GitHub"
    },
    "sidebar": {
      "rtl": "RTL",
      "adapters": "Adaptadores",
      "astro": "Astro",
      "changelog": "Registro de cambios",
      "cli": "CLI",
      "core": "Núcleo",
      "expo": "Expo",
      "gettingStarted": "Guía de inicio",
      "installation": "Instalación",
      "introduction": "Introducción",
      "mission": "Misión",
      "mdAndMdx": "MD & MDX",
      "nextjs": "Next.js",
      "react": "React",
      "skills": "Habilidades",
      "tanstackStart": "TanStack Router"
    }
  }
} as const;

export default es;
