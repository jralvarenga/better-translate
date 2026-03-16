import { DocsHeader } from "@/components/docs-header"
import { DocsSidebar } from "@/components/docs-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import type { LandingLocale } from "@/lib/i18n/config"

export default async function DocsLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params

    return (
        <div
            className="bg-background"
            style={{ "--docs-header-height": "3.5rem" } as React.CSSProperties}
        >
            <DocsHeader currentLocale={lang as LandingLocale} />
            <SidebarProvider className="pt-14">
                <DocsSidebar />
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </SidebarProvider>
        </div>
    )
}
