import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <main className="flex min-h-[42rem] w-full max-w-4xl flex-col justify-between rounded-[2rem] border border-black/5 bg-white px-8 py-10 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-zinc-950 sm:px-12 sm:py-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-3 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-600 dark:border-white/10 dark:text-zinc-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Better Translate + Next.js
          </div>
          <nav className="flex flex-wrap gap-3 text-sm font-medium">
            <Link
              className="rounded-full border border-black/10 px-4 py-2 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.06]"
              href="/app/en"
            >
              Open English demo
            </Link>
            <Link
              className="rounded-full border border-black/10 px-4 py-2 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.06]"
              href="/app/es"
            >
              Open Spanish demo
            </Link>
            <Link
              className="rounded-full border border-black/10 px-4 py-2 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.06]"
              href="/login"
            >
              Login
            </Link>
          </nav>
        </header>

        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-2xl text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 sm:text-5xl sm:leading-[1.05]">
            Scoped locale routing, without forcing every route into
            translations.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            This example keeps{" "}
            <code className="rounded bg-black/[0.04] px-2 py-1 text-sm dark:bg-white/[0.08]">
              /
            </code>{" "}
            and{" "}
            <code className="rounded bg-black/[0.04] px-2 py-1 text-sm dark:bg-white/[0.08]">
              /login
            </code>{" "}
            outside the i18n scope, while the localized demo lives under{" "}
            <code className="rounded bg-black/[0.04] px-2 py-1 text-sm dark:bg-white/[0.08]">
              /app/[lang]
            </code>
            .
          </p>
          <p className="max-w-2xl text-base leading-7 text-zinc-500 dark:text-zinc-400">
            Start with either locale, switch languages from the top header, and
            move through localized routes without changing the visual language
            of the starter app.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row sm:flex-wrap">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[190px]"
            href="/app/en"
          >
            English demo
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 md:w-[190px]"
            href="/app/es"
          >
            Spanish demo
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[160px]"
            href="/login"
          >
            Login page
          </Link>
        </div>

        <div className="grid gap-4 border-t border-black/5 pt-6 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400 sm:grid-cols-2">
          <p>
            The localized area uses the new{" "}
            <code className="rounded bg-black/[0.04] px-2 py-1 text-xs dark:bg-white/[0.08]">
              @better-translate/nextjs
            </code>{" "}
            helpers with a user-owned proxy.
          </p>
          <p>
            For the base Next.js starter resources, head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
      </main>
    </div>
  );
}
