"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { setLocale } from "@/lib/i18n/actions";
import { locales, type Locale } from "@/lib/i18n/locale";

interface HeaderProps {
  currentLocale: Locale;
  navHome: string;
  navDocs: string;
  localeLabel: string;
}

export function Header({ currentLocale, navHome, navDocs, localeLabel }: HeaderProps) {
  const router = useRouter();

  async function handleLocaleChange(locale: Locale) {
    await setLocale(locale);
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="font-mono text-sm font-semibold text-foreground">
          <span className="text-brand">[bt]</span>{" "}
          <span className="text-muted hidden sm:inline">md-nextjs-example</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-sm text-muted hover:bg-accent hover:text-foreground transition-colors"
          >
            {navHome}
          </Link>
          <Link
            href="/docs"
            className="rounded-md px-3 py-1.5 text-sm text-muted hover:bg-accent hover:text-foreground transition-colors"
          >
            {navDocs}
          </Link>
        </nav>

        {/* Locale switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted hidden sm:block">{localeLabel}:</span>
          <div className="flex rounded-md border border-white/10 overflow-hidden">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                disabled={locale === currentLocale}
                className={`px-2.5 py-1 text-xs font-mono font-medium transition-colors ${
                  locale === currentLocale
                    ? "bg-brand text-white cursor-default"
                    : "text-muted hover:bg-accent hover:text-foreground cursor-pointer"
                }`}
              >
                {locale.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
