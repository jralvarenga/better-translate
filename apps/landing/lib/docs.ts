export type DocsSidebarNameKey =
  | "introduction"
  | "mission"
  | "installation"
  | "cli"
  | "skills"
  | "rtl"
  | "changelog"
  | "core"
  | "react"
  | "expo"
  | "astro"
  | "mdAndMdx"
  | "nextjs"
  | "tanstackStart";

export type DocsSection = "adapters" | "gettingStarted";

export type DocsRoute = {
  documentId: string;
  href: string;
  nameKey: DocsSidebarNameKey;
  section: DocsSection;
};

export const docsRoutes = [
  {
    documentId: "introduction",
    href: "/docs",
    nameKey: "introduction",
    section: "gettingStarted",
  },
  {
    documentId: "mission",
    href: "/docs/mission",
    nameKey: "mission",
    section: "gettingStarted",
  },
  {
    documentId: "installation",
    href: "/docs/installation",
    nameKey: "installation",
    section: "gettingStarted",
  },
  {
    documentId: "cli",
    href: "/docs/cli",
    nameKey: "cli",
    section: "gettingStarted",
  },
  {
    documentId: "skills",
    href: "/docs/skills",
    nameKey: "skills",
    section: "gettingStarted",
  },
  {
    documentId: "rtl",
    href: "/docs/rtl",
    nameKey: "rtl",
    section: "gettingStarted",
  },
  {
    documentId: "changelog",
    href: "/docs/changelog",
    nameKey: "changelog",
    section: "gettingStarted",
  },
  {
    documentId: "adapters-core",
    href: "/docs/adapters/core",
    nameKey: "core",
    section: "adapters",
  },
  {
    documentId: "adapters-react",
    href: "/docs/adapters/react",
    nameKey: "react",
    section: "adapters",
  },
  {
    documentId: "adapters-expo",
    href: "/docs/adapters/expo",
    nameKey: "expo",
    section: "adapters",
  },
  {
    documentId: "adapters-astro",
    href: "/docs/adapters/astro",
    nameKey: "astro",
    section: "adapters",
  },
  {
    documentId: "adapters-md",
    href: "/docs/adapters/md",
    nameKey: "mdAndMdx",
    section: "adapters",
  },
  {
    documentId: "adapters-nextjs",
    href: "/docs/adapters/nextjs",
    nameKey: "nextjs",
    section: "adapters",
  },
  {
    documentId: "adapters-tanstack-router",
    href: "/docs/adapters/tanstack-router",
    nameKey: "tanstackStart",
    section: "adapters",
  },
] as const satisfies readonly DocsRoute[];

export const gettingStartedDocsRoutes = docsRoutes.filter(
  (route) => route.section === "gettingStarted",
);

export const adapterDocsRoutes = docsRoutes.filter(
  (route) => route.section === "adapters",
);

export function getDocsRouteByDocumentId(documentId: string) {
  return docsRoutes.find((route) => route.documentId === documentId);
}
