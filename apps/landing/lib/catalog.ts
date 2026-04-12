import type { TranslationKey } from "@better-translate/core";

import { createElement, type ComponentType } from "react";

import { RiNextjsFill, RiNodejsLine, RiReactjsLine } from "@remixicon/react";

import { AstroLogo, BunIcon, TanStackIcon } from "@/components/logo";
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

const TypeScriptIcon = ({ className }: { className?: string }) =>
  createElement(
    "span",
    {
      className: `font-mono font-bold text-blue-500 ${className ?? ""}`,
    },
    "TS",
  );

const catalog = [
  {
    descriptionKey: "frameworks.items.typescript.description",
    icon: TypeScriptIcon,
    iconClassName: "text-blue-500",
    id: "typescript",
    install: "bun add @better-translate/core",
    kind: "framework",
    name: "TypeScript",
  },
  {
    descriptionKey: "frameworks.items.astro.description",
    icon: AstroLogo,
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
    install: "bun add @better-translate/core",
    kind: "framework",
    name: "Bun",
  },
  {
    descriptionKey: "frameworks.items.nodejs.description",
    icon: RiNodejsLine,
    iconClassName: "text-green-500",
    id: "nodejs",
    install: "bun add @better-translate/core",
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
  return catalog.filter(
    (item) => item.kind === kind,
  ) as unknown as readonly CatalogItem<TKind>[];
}
