import {
  RiShieldCheckLine,
  RiCodeSSlashLine,
  RiTranslate2,
  RiPlugLine,
} from "@remixicon/react";
import type { LandingTranslator } from "@/lib/i18n/config";

const features = [
  {
    icon: RiPlugLine,
    id: "frameworkAgnostic" as const,
  },
  {
    icon: RiShieldCheckLine,
    id: "typeSafe" as const,
  },
  {
    icon: RiCodeSSlashLine,
    id: "autocomplete" as const,
  },
  {
    icon: RiTranslate2,
    id: "localeSwitching" as const,
  },
] as const;

interface FeaturesProps {
  t: LandingTranslator["t"];
}

export function Features({ t }: FeaturesProps) {
  const featureCopy = {
    autocomplete: {
      description: t("features.items.autocomplete.description"),
      title: t("features.items.autocomplete.title"),
    },
    frameworkAgnostic: {
      description: t("features.items.frameworkAgnostic.description"),
      title: t("features.items.frameworkAgnostic.title"),
    },
    localeSwitching: {
      description: t("features.items.localeSwitching.description"),
      title: t("features.items.localeSwitching.title"),
    },
    typeSafe: {
      description: t("features.items.typeSafe.description"),
      title: t("features.items.typeSafe.title"),
    },
  };

  return (
    <section id="features" className="py-20 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {t("features.title")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("features.description")}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-6 transition-all duration-200 hover:bg-white/8 hover:border-white/20"
            >
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/8">
                <feature.icon className="size-4 text-white/80" />
              </div>
              <div>
                <h3 className="mb-1 font-medium text-foreground">
                  {featureCopy[feature.id].title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {featureCopy[feature.id].description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
