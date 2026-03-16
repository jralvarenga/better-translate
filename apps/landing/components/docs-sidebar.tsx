"use client"

import { usePathname } from "next/navigation"
import { I18nLink } from "@/lib/i18n/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const GETTING_STARTED = [
    { name: "Introduction", href: "/docs" },
    { name: "Installation", href: "/docs/installation" },
    { name: "CLI", href: "/docs/cli" },
    { name: "Skills", href: "/docs/skills" },
    { name: "Changelog", href: "/docs/changelog" },
]

const ADAPTERS = [
    { name: "Core", href: "/docs/adapters/core" },
    { name: "React", href: "/docs/adapters/react" },
    { name: "Next.js", href: "/docs/adapters/nextjs" },
    { name: "TanStack Start", href: "/docs/adapters/tanstack-start" },
    { name: "MD & MDX", href: "/docs/adapters/md-and-mdx" },
]

export function DocsSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    function isActive(href: string) {
        if (href === "/docs") {
            return pathname.endsWith("/docs")
        }
        return pathname.includes(href)
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
                    <SidebarGroupLabel className="font-medium text-muted-foreground">
                        Getting Started
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {GETTING_STARTED.map(({ name, href }) => (
                                <SidebarMenuItem key={href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(href)}
                                        className="relative h-[30px] w-fit overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-accent data-[active=true]:bg-accent 3xl:fixed:w-full 3xl:fixed:max-w-48"
                                    >
                                        <I18nLink href={href}>
                                            <span className="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent" />
                                            {name}
                                        </I18nLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className="font-medium text-muted-foreground">
                        Adapters
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5">
                            {ADAPTERS.map(({ name, href }) => (
                                <SidebarMenuItem key={href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(href)}
                                        className="relative h-[30px] w-fit overflow-visible border border-transparent text-[0.8rem] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:border-accent data-[active=true]:bg-accent 3xl:fixed:w-full 3xl:fixed:max-w-48"
                                    >
                                        <I18nLink href={href}>
                                            <span className="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent" />
                                            {name}
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
    )
}
