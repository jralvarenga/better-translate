export const en = {
  codeDemo: {
    description: "The same config works identically whether you're in Next.js, Astro, React, or plain Node.",
    title: "One API. Every environment",
  },
  features: {
    description: "The same setup, the same API, the same experience ,  no matter which TypeScript environment you're in.",
    items: {
      autocomplete: {
        description:
          'Your editor knows every key in your messages object. No more guessing because `t("home.` starts completing instantly.',
        title: "Autocomplete Everywhere",
      },
      frameworkAgnostic: {
        description:
          "Write your translation config once. It works identically in Next.js, Astro, React, TanStack Router, and plain Node. Switch environments, keep your setup.",
        title: "Same Config, Every Environment",
      },
      localeSwitching: {
        description:
          "Switch locales at runtime without a page reload. Per-call overrides let you render any locale on demand.",
        title: "Locale Switching",
      },
      typeSafe: {
        description:
          "Full TypeScript inference on translation keys and interpolation variables. Typos and missing keys become compile errors.",
        title: "Type-Safe by Default",
      },
    },
    title: "Same setup. Every environment",
  },
  footer: {
    docs: "Docs",
    github: "GitHub",
    legal: "MIT License · built with TypeScript",
    npm: "npm",
  },
  frameworks: {
    description:
      "Your translation config works the same way in every TypeScript environment. Native adapters, identical API.",
    heroDescription:
      "Switch frameworks without rewriting your i18n setup",
    heroTitle: "Same config everywhere",
    items: {
      astro: {
        description: "Request-scoped helpers and localized Astro content collections for .md and .mdx.",
      },
      bun: {
        description: "Native Bun runtime support with zero extra setup.",
      },
      nextjs: {
        description: "Server components, App Router, and route-aware locale helpers.",
      },
      nodejs: {
        description: "Zero-dependency core for scripts, servers, and background jobs.",
      },
      react: {
        description: "Context, hooks, and locale-aware client rendering for React apps.",
      },
      tanstack: {
        description: "Type-safe routing support for TanStack Router projects, including TanStack Start apps.",
      },
      typescript: {
        description: "Strong types, autocomplete, and compile-time feedback from your messages.",
      },
    },
    title: "Your framework, your choice",
  },
  header: {
    changelog: "Changelog",
    cli: "CLI",
    closeMenu: "Close menu",
    docs: "Docs",
    github: "GitHub",
    language: "Language",
    languageSwitcher: "Switch language",
    openMenu: "Open menu",
  },
  hero: {
    badge: "Same config. Every TypeScript environment",
    description:
      "Same config. Same API. Works in Next.js, Astro, React, TanStack Router, and plain Node. No rewrites.",
    primaryCta: "View docs",
    secondaryCta: "View on GitHub",
    title: "One i18n setup for any TypeScript project",
  },
  docs: {
    copyMarkdown: "Copy markdown",
    copiedMarkdown: "Copied",
    header: {
      home: "Home",
      github: "GitHub",
    },
    sidebar: {
      rtl: "RTL",
      adapters: "Adapters",
      astro: "Astro",
      changelog: "Changelog",
      cli: "CLI",
      core: "Core",
      expo: "Expo",
      gettingStarted: "Getting Started",
      installation: "Installation",
      introduction: "Introduction",
      mission: "Mission",
      mdAndMdx: "MD & MDX",
      nextjs: "Next.js",
      react: "React",
      skills: "Skills",
      tanstackStart: "TanStack Router",
    },
  },
} as const;
