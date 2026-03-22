import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <main className="flex min-h-[34rem] w-full max-w-3xl flex-col justify-between rounded-[2rem] border border-black/5 bg-white px-8 py-10 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-zinc-950 sm:px-12 sm:py-12">
        <header className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-3 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-600 dark:border-white/10 dark:text-zinc-300">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
            Out of locale scope
          </div>
          <Link
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.06]"
            href="/"
          >
            Back home
          </Link>
        </header>

        <div className="flex flex-col gap-6">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <div className="space-y-4">
            <h1 className="max-w-xl text-3xl font-semibold leading-10 tracking-tight sm:text-4xl">
              Login stays outside the localized route tree.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              This page proves that only{" "}
              <code className="rounded bg-black/[0.04] px-2 py-1 text-sm dark:bg-white/[0.08]">
                /app/[lang]
              </code>{" "}
              is controlled by Better Translate routing. Everything else behaves
              like a normal Next.js route.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[190px]"
            href="/app/en"
          >
            Open English demo
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[170px]"
            href="/app/es"
          >
            Open Spanish demo
          </Link>
        </div>
      </main>
    </div>
  );
}
