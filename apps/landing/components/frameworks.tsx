import { getCatalogItems, type FrameworkId } from "@/lib/catalog";
import type { LandingTranslator } from "@/lib/i18n/config";
import { I18nLink } from "@/lib/i18n/navigation";
import { RiArrowRightLine } from "@remixicon/react";

interface FrameworksProps {
  t: LandingTranslator["t"];
}

export function Frameworks({ t }: FrameworksProps) {
  const frameworks = getCatalogItems("framework");
  const frameworkDescriptions: Record<FrameworkId, string> = {
    astro: t("frameworks.items.astro.description"),
    bun: t("frameworks.items.bun.description"),
    nextjs: t("frameworks.items.nextjs.description"),
    nodejs: t("frameworks.items.nodejs.description"),
    react: t("frameworks.items.react.description"),
    tanstack: t("frameworks.items.tanstack.description"),
    typescript: t("frameworks.items.typescript.description"),
  };

  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {t("frameworks.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("frameworks.description")}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {frameworks.map((fw) => (
            <div
              key={fw.name}
              className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-6 transition-all duration-200 hover:bg-white/8 hover:border-white/20"
            >
              <fw.icon
                className={`size-8 ${fw.iconClassName ?? ""} rounded-full`}
              />
              <div>
                <h3 className="mb-1 font-medium text-foreground">{fw.name}</h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  {frameworkDescriptions[fw.id]}
                </p>
                <code className="block text-xs text-muted-foreground/70 break-all">
                  {fw.install}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-12 flex justify-center">
        <I18nLink
          href="/adapters"
          className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:border-white/20 hover:bg-white/8"
        >
          <span>{t("adapters.viewAll")}</span>
          <RiArrowRightLine className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
        </I18nLink>
      </div>
    </section>
  );
}
