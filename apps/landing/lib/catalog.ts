import { createElement, type ComponentType } from "react";

import { RiNextjsFill, RiNodejsLine, RiReactjsLine } from "@remixicon/react";

import { AstroLogo, BunIcon, TanStackIcon } from "@/components/logo";

export type CatalogKind = "framework";
export type FrameworkId =
  | "astro"
  | "bun"
  | "nextjs"
  | "nodejs"
  | "react"
  | "tanstack"
  | "typescript";

type CatalogShape = {
  framework: {
    icon: ComponentType<{
      className?: string;
    }>;
    iconClassName?: string;
    id: FrameworkId;
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
    icon: TypeScriptIcon,
    iconClassName: "text-blue-500",
    id: "typescript",
    install: "bun add @better-translate/core",
    kind: "framework",
    name: "TypeScript",
  },
  {
    icon: AstroLogo,
    iconClassName: "size-8 text-[#17191f]",
    id: "astro",
    install: "bun add @better-translate/astro",
    kind: "framework",
    name: "Astro",
  },
  {
    icon: BunIcon,
    id: "bun",
    install: "bun add @better-translate/core",
    kind: "framework",
    name: "Bun",
  },
  {
    icon: RiNodejsLine,
    iconClassName: "text-green-500",
    id: "nodejs",
    install: "bun add @better-translate/core",
    kind: "framework",
    name: "Node.js",
  },
  {
    icon: RiReactjsLine,
    iconClassName: "text-cyan-400",
    id: "react",
    install: "bun add @better-translate/react",
    kind: "framework",
    name: "React",
  },
  {
    icon: RiNextjsFill,
    iconClassName: "text-white",
    id: "nextjs",
    install: "bun add @better-translate/nextjs",
    kind: "framework",
    name: "Next.js",
  },
  {
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
