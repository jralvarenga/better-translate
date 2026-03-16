import type { TranslationKey } from "better-translate/core";

import { createElement, type ComponentType } from "react";

import { RiNextjsFill, RiNodejsLine, RiReactjsLine } from "@remixicon/react";

import { BunIcon, TanStackIcon } from "@/components/logo";
import type { LandingLocale } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/messages/en";

export type CatalogKind = "framework" | "language";

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
  language: {
    emoji: string;
    id: string;
    kind: "language";
    locale: LandingLocale;
    nativeLabel: string;
    shortLabel: string;
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
    install: "bun add @better-translate/tanstack-start",
    kind: "framework",
    name: "TanStack Start/Router",
  },
  {
    emoji: "🇺🇸",
    id: "en",
    kind: "language",
    locale: "en",
    nativeLabel: "English",
    shortLabel: "EN",
  },
  {
    emoji: "🇪🇸",
    id: "es",
    kind: "language",
    locale: "es",
    nativeLabel: "Español",
    shortLabel: "ES",
  },
] as const satisfies readonly AnyCatalogItem[];

export function getCatalogItems<TKind extends CatalogKind>(
  kind: TKind,
): readonly CatalogItem<TKind>[] {
  return catalog.filter((item) => item.kind === kind) as unknown as readonly CatalogItem<TKind>[];
}
