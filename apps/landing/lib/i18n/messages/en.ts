export const en = {
  codeDemo: {
    description: "Configure once, create typed helpers everywhere.",
    title: "Simple two-step API",
  },
  features: {
    description: "Everything you need for production-grade i18n, nothing extra.",
    items: {
      autocomplete: {
        description:
          'Your editor knows every key in your messages object. No more guessing because `t("home.` starts completing instantly.',
        title: "Autocomplete Everywhere",
      },
      frameworkAgnostic: {
        description:
          "Zero framework lock-in. One core package, first-class adapters for React, Next.js, TanStack Router, and plain Node.",
        title: "Framework Agnostic",
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
    title: "Built for TypeScript teams",
  },
  footer: {
    docs: "Docs",
    github: "GitHub",
    legal: "MIT License · built with TypeScript",
    npm: "npm",
  },
  frameworks: {
    description:
      "One shared translation core. Native adapters for every major TypeScript framework, or use the core directly.",
    heroDescription:
      "No framework lock-in - one core, zero runtime dependencies",
    heroTitle: "Works with any TypeScript project",
    items: {
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
    badge: "Framework agnostic - works in any TypeScript project",
    description:
      "Define your translations once. Get autocomplete, type errors, and locale switching - no framework lock-in. Works in any TypeScript codebase.",
    primaryCta: "View docs",
    secondaryCta: "View on GitHub",
    title: "Type-Safe Translations for TypeScript",
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
      changelog: "Changelog",
      cli: "CLI",
      core: "Core",
      gettingStarted: "Getting Started",
      installation: "Installation",
      introduction: "Introduction",
      mdAndMdx: "MD & MDX",
      nextjs: "Next.js",
      react: "React",
      skills: "Skills",
      tanstackStart: "TanStack Router",
    },
  },
} as const;
