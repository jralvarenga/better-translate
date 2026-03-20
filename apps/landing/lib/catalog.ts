import type { TranslationKey } from "better-translate/core";

import { createElement, type ComponentType } from "react";

import { RiNextjsFill, RiNodejsLine, RiReactjsLine } from "@remixicon/react";

import { BunIcon, TanStackIcon } from "@/components/logo";
import { en } from "@/lib/i18n/messages/en";

export type CatalogKind = "framework";

type LandingMessageKey = TranslationKey<typeof en>;
type FrameworkDescriptionKey = Extract<
  LandingMessageKey,
  `frameworks.items.${string}.description`
>;

type CatalogShape = {
  framework: {
    descriptionKey: FrameworkDescriptionKey;
    icon: ComponentType<{
      className?: string;
    }>;
    iconClassName?: string;
    id: string;
    install: string;
    kind: "framework";
    name: string;
  };
};

type AnyCatalogItem = CatalogShape[CatalogKind];

export type CatalogItem<TKind extends CatalogKind = CatalogKind> = Extract<
  AnyCatalogItem,
  {
    kind: TKind;
  }
>;

const TypeScriptIcon = ({ className }: { className?: string }) => (
  createElement(
    "span",
    {
      className: `font-mono font-bold text-blue-500 ${className ?? ""}`,
    },
    "TS",
  )
);

const AstroIcon = ({ className }: { className?: string }) => (
  createElement(
    "svg",
    {
      "aria-hidden": "true",
      className: className ?? "",
      fill: "none",
      viewBox: "0 0 64 64",
      xmlns: "http://www.w3.org/2000/svg",
    },
    createElement("path", {
      d: "M17.35 50.96c4.14-2.01 8.28-2.7 12.4-2.07 3.1.47 5.56 1.42 7.39 2.84 1.74 1.37 3.13 3.16 4.16 5.38.18.37.53.61.94.64.42.02.79-.17 1.01-.51 2.17-3.42 3.63-7.39 4.38-11.9L54.9 13.6c.15-.67-.06-1.37-.57-1.83a2 2 0 0 0-1.91-.45c-3.44.99-6.83 1.49-10.17 1.49H21.77c-3.34 0-6.73-.5-10.17-1.49a2 2 0 0 0-1.91.45c-.51.46-.72 1.16-.57 1.83l7.31 31.74c.46 1.99.91 3.85 1.37 5.62Z",
      fill: "currentColor",
    }),
    createElement("path", {
      d: "M41.54 36.18c-1.82 1.11-4.06 1.66-6.72 1.66-2.14 0-3.79-.38-4.95-1.13-1.19-.78-1.79-1.86-1.79-3.24 0-1.13.39-2.05 1.17-2.77.77-.73 1.8-1.09 3.1-1.09 1.05 0 1.97.22 2.77.66.84.45 1.58 1.14 2.21 2.06.34.49.76.73 1.28.73.49 0 .91-.18 1.26-.53.35-.35.53-.77.53-1.26 0-1.89-.82-3.5-2.45-4.85-1.63-1.35-3.75-2.02-6.37-2.02-2.95 0-5.36.81-7.24 2.43-1.87 1.59-2.8 3.7-2.8 6.31 0 3 1.12 5.4 3.38 7.21 2.2 1.77 5.23 2.66 9.07 2.66 3.54 0 6.48-.74 8.82-2.21 2.37-1.49 3.56-3.39 3.56-5.68 0-.49-.18-.91-.53-1.26-.35-.35-.77-.53-1.26-.53-.72 0-1.23.36-1.54 1.08-.42 1.03-1.25 1.91-2.49 2.63Z",
      fill: "#ff5d01",
    }),
  )
);

const catalog = [
  {
    descriptionKey: "frameworks.items.typescript.description",
    icon: TypeScriptIcon,
    iconClassName: "text-blue-500",
    id: "typescript",
    install: "bun add better-translate",
    kind: "framework",
    name: "TypeScript",
  },
  {
    descriptionKey: "frameworks.items.astro.description",
    icon: AstroIcon,
    iconClassName: "size-8 text-[#17191f]",
    id: "astro",
    install: "bun add @better-translate/astro",
    kind: "framework",
    name: "Astro",
  },
  {
    descriptionKey: "frameworks.items.bun.description",
    icon: BunIcon,
    id: "bun",
    install: "bun add better-translate",
    kind: "framework",
    name: "Bun",
  },
  {
    descriptionKey: "frameworks.items.nodejs.description",
    icon: RiNodejsLine,
    iconClassName: "text-green-500",
    id: "nodejs",
    install: "bun add better-translate",
    kind: "framework",
    name: "Node.js",
  },
  {
    descriptionKey: "frameworks.items.react.description",
    icon: RiReactjsLine,
    iconClassName: "text-cyan-400",
    id: "react",
    install: "bun add @better-translate/react",
    kind: "framework",
    name: "React",
  },
  {
    descriptionKey: "frameworks.items.nextjs.description",
    icon: RiNextjsFill,
    iconClassName: "text-white",
    id: "nextjs",
    install: "bun add @better-translate/nextjs",
    kind: "framework",
    name: "Next.js",
  },
  {
    descriptionKey: "frameworks.items.tanstack.description",
    icon: TanStackIcon,
    iconClassName: "text-orange-400",
    id: "tanstack",
    install: "bun add @better-translate/tanstack-router",
    kind: "framework",
    name: "TanStack Router",
  },
] as const satisfies readonly AnyCatalogItem[];

export function getCatalogItems<TKind extends CatalogKind>(
  kind: TKind,
): readonly CatalogItem<TKind>[] {
  return catalog.filter((item) => item.kind === kind) as unknown as readonly CatalogItem<TKind>[];
}
