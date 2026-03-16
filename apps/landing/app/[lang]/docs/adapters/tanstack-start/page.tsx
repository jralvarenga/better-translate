export default function DocsAdapterTanStackPage() {
    return (
        <div className="max-w-3xl px-6 py-10 lg:px-10 space-y-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">TanStack Start</h1>
                <p className="mt-3 text-muted-foreground text-base leading-relaxed">
                    <code className="bg-accent px-1 rounded text-xs font-mono">@better-translate/tanstack-start</code> is
                    a scaffold package for TanStack Start integration.
                </p>
            </div>

            <section className="space-y-4">
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                    <p className="text-sm font-medium text-amber-400">Work in progress</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        This adapter is not fully implemented yet. The package exists as a scaffold.
                        TanStack Start integration is on the roadmap. For now, you can use the core
                        package directly with TanStack Start using the global helpers.
                    </p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Using core with TanStack Start today</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Until the dedicated adapter ships, you can use the core package and React adapter
                    directly in TanStack Start apps. Configure translations at the app entry point and
                    use global helpers or the React provider in your components.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">Package location</h2>
                <p className="text-sm text-muted-foreground">
                    <code className="bg-accent px-1 rounded text-xs font-mono">packages/tanstack-start</code>
                </p>
            </section>
        </div>
    )
}
