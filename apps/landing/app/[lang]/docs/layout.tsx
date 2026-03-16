import { DocsHeader } from "@/components/docs-header"
import { DocsSidebar } from "@/components/docs-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="bg-background"
            style={{ "--docs-header-height": "3.5rem" } as React.CSSProperties}
        >
            <DocsHeader />
            <SidebarProvider className="pt-14">
                <DocsSidebar />
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </SidebarProvider>
        </div>
    )
}
