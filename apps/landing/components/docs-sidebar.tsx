"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "@better-translate/react";
import { I18nLink } from "@/lib/i18n/navigation";
import type { LandingTranslator } from "@/lib/i18n/config";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const GETTING_STARTED = [
  { href: "/docs", key: "introduction" as const },
  { href: "/docs/mission", key: "mission" as const },
  { href: "/docs/installation", key: "installation" as const },
  { href: "/docs/cli", key: "cli" as const },
  { href: "/docs/skills", key: "skills" as const },
  { href: "/docs/rtl", key: "rtl" as const },
  { href: "/docs/changelog", key: "changelog" as const },
];

const ADAPTERS = [
  { href: "/docs/adapters/core", key: "core" as const },
  { href: "/docs/adapters/react", key: "react" as const },
  { href: "/docs/adapters/expo", key: "expo" as const },
  { href: "/docs/adapters/astro", key: "astro" as const },
  { href: "/docs/adapters/md", key: "mdAndMdx" as const },
  { href: "/docs/adapters/nextjs", key: "nextjs" as const },
  {
    href: "/docs/adapters/tanstack-router",
    key: "tanstackStart" as const,
  },
];

export function DocsSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const t = useTranslations<LandingTranslator>().t;
  const gettingStartedLabels = {
    changelog: t("docs.sidebar.changelog"),
    cli: t("docs.sidebar.cli"),
    installation: t("docs.sidebar.installation"),
    introduction: t("docs.sidebar.introduction"),
    mission: t("docs.sidebar.mission"),
    rtl: t("docs.sidebar.rtl"),
    skills: t("docs.sidebar.skills"),
  };
  const adapterLabels = {
    astro: t("docs.sidebar.astro"),
    core: t("docs.sidebar.core"),
    expo: t("docs.sidebar.expo"),
    mdAndMdx: t("docs.sidebar.mdAndMdx"),
    nextjs: t("docs.sidebar.nextjs"),
    react: t("docs.sidebar.react"),
    tanstackStart: t("docs.sidebar.tanstackStart"),
  };

  function isActive(href: string) {
    if (href === "/docs") {
      return pathname.endsWith("/docs");
    }
    return pathname.includes(href);
  }

  return (
    <Sidebar
      className="sticky top-[calc(var(--docs-header-height)+0.6rem)] z-30 hidden h-[calc(100svh-var(--docs-header-height)-2rem)] overscroll-none bg-transparent [--sidebar-menu-width:--spacing(56)] lg:flex"
      collapsible="none"
      {...props}
    >
      <div className="h-9" />
      <div className="absolute top-8 z-10 h-8 w-(--sidebar-menu-width) shrink-0 bg-linear-to-b from-background via-background/80 to-background/50 blur-xs" />
      <div className="absolute top-12 right-2 bottom-0 hidden h-full w-px bg-linear-to-b from-transparent via-border to-transparent lg:flex" />
      <SidebarContent className="mx-auto no-scrollbar w-(--sidebar-menu-width) overflow-x-hidden px-2">
        <SidebarGroup className="pt-6">
          <SidebarGroupLabel className="font-medium text-muted-foreground text-[0.7rem] uppercase tracking-widest">
            {t("docs.sidebar.gettingStarted")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {GETTING_STARTED.map(({ href, key }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(href)}
                    className="relative h-[30px] w-fit overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-white/15 data-[active=true]:bg-white/8 data-[active=true]:text-foreground 3xl:fixed:w-full 3xl:fixed:max-w-48"
                  >
                    <I18nLink href={href}>
                      <span className="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent" />
                      {gettingStartedLabels[key]}
                    </I18nLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-medium text-muted-foreground text-[0.7rem] uppercase tracking-widest">
            {t("docs.sidebar.adapters")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {ADAPTERS.map(({ href, key }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(href)}
                    className="relative h-[30px] w-fit overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-white/15 data-[active=true]:bg-white/8 data-[active=true]:text-foreground 3xl:fixed:w-full 3xl:fixed:max-w-48"
                  >
                    <I18nLink href={href}>
                      <span className="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent" />
                      {adapterLabels[key]}
                    </I18nLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="sticky -bottom-1 z-10 h-16 shrink-0 bg-linear-to-t from-background via-background/80 to-background/50 blur-xs" />
      </SidebarContent>
    </Sidebar>
  );
}
