import Link from 'next/link'
import { Logo } from '@/components/logo'

export function Footer() {
    return (
        <footer className="border-t bg-background py-12">
            <div className="mx-auto max-w-5xl px-6">
                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <Logo />
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <Link href="process.env.NEXT_PUBLIC_GITHUB_URL!" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                            GitHub
                        </Link>
                        <Link href="https://www.npmjs.com/package/better-translate" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                            npm
                        </Link>
                        <Link href="#docs" className="hover:text-foreground transition-colors">
                            Docs
                        </Link>
                    </div>
                </div>
                <p className="mt-8 text-center text-xs text-muted-foreground">
                    MIT License · built with TypeScript
                </p>
            </div>
        </footer>
    )
}
