import { RiReactjsLine, RiNextjsFill, RiNodejsLine } from '@remixicon/react'
import { BunIcon, TanStackIcon } from '@/components/logo'

const frameworks = [
    {
        icon: RiReactjsLine,
        iconColor: 'text-cyan-400',
        name: 'React',
        install: 'bun add @better-translate/react',
        description: 'Hooks and context provider for React apps',
    },
    {
        icon: RiNextjsFill,
        iconColor: 'text-white',
        name: 'Next.js',
        install: 'bun add @better-translate/nextjs',
        description: 'Server components, App Router, and RSC support',
    },
    {
        icon: TanStackIcon,
        iconColor: '',
        name: 'TanStack Start/Router',
        install: 'bun add @better-translate/tanstack-start',
        description: 'Full-stack type-safe routing integration',
    },
    {
        icon: RiNodejsLine,
        iconColor: 'text-green-500',
        name: 'Node.js',
        install: 'bun add better-translate',
        description: 'Zero-dependency core for any Node server',
    },
    {
        icon: BunIcon,
        iconColor: '',
        name: 'Bun',
        install: 'bun add better-translate',
        description: 'Native Bun runtime support, zero config',
    },
]

export function Frameworks() {
    return (
        <section className="bg-background py-20 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Your framework, your choice</h2>
                    <p className="mt-4 text-muted-foreground">One shared translation core. Native adapters for every major TypeScript framework — or use the core directly.</p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {frameworks.map((fw) => (
                        <div key={fw.name} className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-6">
                            <fw.icon className={`size-8 ${fw.iconColor} rounded-full`} />
                            <div>
                                <h3 className="mb-1 font-medium text-foreground">{fw.name}</h3>
                                <p className="mb-3 text-xs text-muted-foreground">{fw.description}</p>
                                <code className="block text-xs text-muted-foreground/70 break-all">{fw.install}</code>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
