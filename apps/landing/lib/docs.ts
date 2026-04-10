import "server-only";

import { cache } from "react";

import type { LandingLocale } from "@/lib/i18n/config";
import { md } from "@/lib/i18n/md";

export type DocFrontmatter = {
  description: string;
  title: string;
};

export type DocPageRoute = {
  documentId: string;
  routePath: string;
};

export const docPageRoutes = [
  {
    documentId: "introduction",
    routePath: "/docs",
  },
  {
    documentId: "mission",
    routePath: "/docs/mission",
  },
  {
    documentId: "installation",
    routePath: "/docs/installation",
  },
  {
    documentId: "cli",
    routePath: "/docs/cli",
  },
  {
    documentId: "skills",
    routePath: "/docs/skills",
  },
  {
    documentId: "rtl",
    routePath: "/docs/rtl",
  },
  {
    documentId: "changelog",
    routePath: "/docs/changelog",
  },
  {
    documentId: "adapters-core",
    routePath: "/docs/adapters/core",
  },
  {
    documentId: "adapters-react",
    routePath: "/docs/adapters/react",
  },
  {
    documentId: "adapters-expo",
    routePath: "/docs/adapters/expo",
  },
  {
    documentId: "adapters-astro",
    routePath: "/docs/adapters/astro",
  },
  {
    documentId: "adapters-md",
    routePath: "/docs/adapters/md",
  },
  {
    documentId: "adapters-nextjs",
    routePath: "/docs/adapters/nextjs",
  },
  {
    documentId: "adapters-tanstack-router",
    routePath: "/docs/adapters/tanstack-router",
  },
] as const satisfies readonly DocPageRoute[];

export const getDocPageDocument = cache(
  async (documentId: string, locale: LandingLocale) =>
    md.getDocument(documentId, {
      locale,
    }),
);

export async function getDocFrontmatter(
  documentId: string,
  locale: LandingLocale,
): Promise<DocFrontmatter> {
  const document = await getDocPageDocument(documentId, locale);

  return {
    description: getRequiredFrontmatter(
      document.frontmatter,
      "description",
      documentId,
    ),
    title: getRequiredFrontmatter(document.frontmatter, "title", documentId),
  };
}

function getRequiredFrontmatter(
  frontmatter: Record<string, unknown>,
  key: "description" | "title",
  documentId: string,
) {
  const value = frontmatter[key];

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  throw new Error(
    `Markdown document "${documentId}" is missing a valid "${key}" frontmatter field.`,
  );
}
