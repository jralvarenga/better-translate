export const es = {
  "codeDemo": {
    "description": "Configura una vez, crea ayudantes tipados en todas partes.",
    "title": "API simple de dos pasos"
  },
  "features": {
    "description": "Todo lo que necesitas para i18n de producción, nada más.",
    "items": {
      "autocomplete": {
        "description": "Tu editor conoce cada clave en tu objeto de mensajes. Ya no tendrás que adivinar, porque `t(\"home.` empieza a completarse de inmediato.",
        "title": "Autocompletado en todas partes"
      },
      "frameworkAgnostic": {
        "description": "Sin acoplamiento a frameworks. Un paquete central, adaptadores de primera clase para React, Next.js, TanStack Router y Node puro.",
        "title": "Independiente del framework"
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
    "title": "Construido para equipos de TypeScript"
  },
  "footer": {
    "docs": "Documentación",
    "github": "GitHub",
    "legal": "Licencia MIT · construido con TypeScript",
    "npm": "npm"
  },
  "frameworks": {
    "description": "Un núcleo de traducción compartido. Adaptadores nativos para cada framework de TypeScript importante, o usa el núcleo directamente.",
    "heroDescription": "Sin acoplamiento a frameworks - un núcleo, cero dependencias en tiempo de ejecución",
    "heroTitle": "Funciona con cualquier proyecto TypeScript",
    "items": {
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
    "badge": "Independiente del framework - funciona en cualquier proyecto TypeScript",
    "description": "Define tus traducciones una vez. Obtén autocompletado, errores de tipo y conmutación de locales - sin acoplamiento a un framework. Funciona en cualquier código TypeScript.",
    "primaryCta": "Ver documentación",
    "secondaryCta": "Ver en GitHub",
    "title": "Traducciones seguras de tipos para TypeScript"
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
      "changelog": "Registro de cambios",
      "cli": "CLI",
      "core": "Núcleo",
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
