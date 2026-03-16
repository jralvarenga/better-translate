import { DocsHeader } from "@/components/docs-header"
import { DocsSidebar } from "@/components/docs-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { setRequestLocale } from "@better-translate/nextjs/server"
import type { LandingLocale } from "@/lib/i18n/config"
import { getTranslations } from "@/lib/i18n/server"

export default async function DocsLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params
    const locale = lang as LandingLocale
    setRequestLocale(locale)
    const t = await getTranslations()

    return (
        <div
            className="bg-background"
            style={{ "--docs-header-height": "3.5rem" } as React.CSSProperties}
        >
            <DocsHeader
                currentLocale={locale}
                homeLabel={t("docs.header.home")}
                githubLabel={t("docs.header.github")}
            />
            <SidebarProvider className="pt-14">
                <DocsSidebar />
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </SidebarProvider>
        </div>
    )
}
