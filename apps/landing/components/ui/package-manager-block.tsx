"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { Highlight } from "@/components/ui/code-highlight";

type PM = "npm" | "pnpm" | "yarn" | "bun";

const PMS: PM[] = ["npm", "pnpm", "yarn", "bun"];

const PM_CHANGE_EVENT = "bt-pm-change";

function transformLine(line: string, pm: PM): string {
  if (pm === "npm") return line;

  // npx <cmd>
  const npxMatch = line.match(/^npx\s+(.+)$/);
  if (npxMatch) {
    const cmd = npxMatch[1];
    if (pm === "pnpm") return `pnpm dlx ${cmd}`;
    if (pm === "yarn") return `yarn dlx ${cmd}`;
    if (pm === "bun") return `bunx ${cmd}`;
  }

  // npm install -D <packages>
  const installDevMatch = line.match(/^npm install\s+-D\s+(.+)$/);
  if (installDevMatch) {
    const packages = installDevMatch[1];
    if (pm === "pnpm") return `pnpm add -D ${packages}`;
    if (pm === "yarn") return `yarn add -D ${packages}`;
    if (pm === "bun") return `bun add -D ${packages}`;
  }

  // npm install <packages>
  const installMatch = line.match(/^npm install\s+(.+)$/);
  if (installMatch) {
    const packages = installMatch[1];
    if (pm === "pnpm") return `pnpm add ${packages}`;
    if (pm === "yarn") return `yarn add ${packages}`;
    if (pm === "bun") return `bun add ${packages}`;
  }

  // npm install (bare)
  if (line.trim() === "npm install") {
    if (pm === "pnpm") return "pnpm install";
    if (pm === "yarn") return "yarn install";
    if (pm === "bun") return "bun install";
  }

  return line;
}

function transformForPm(code: string, pm: PM): string {
  return code
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("#"))
    .map((line) => transformLine(line, pm))
    .join("\n")
    .trim();
}

function getStoredPm(): PM {
  if (typeof window === "undefined") return "npm";
  const stored = localStorage.getItem("preferred-pm");
  if (
    stored === "npm" ||
    stored === "pnpm" ||
    stored === "yarn" ||
    stored === "bun"
  ) {
    return stored;
  }
  return "npm";
}

export function PackageManagerBlock({ code }: { code: string }) {
  const [pm, setPm] = useState<PM>("npm");

  useEffect(() => {
    setPm(getStoredPm());

    const handler = (e: Event) => {
      const event = e as CustomEvent<PM>;
      setPm(event.detail);
    };

    window.addEventListener(PM_CHANGE_EVENT, handler);
    return () => window.removeEventListener(PM_CHANGE_EVENT, handler);
  }, []);

  function handleSelect(next: PM) {
    localStorage.setItem("preferred-pm", next);
    window.dispatchEvent(
      new CustomEvent<PM>(PM_CHANGE_EVENT, { detail: next }),
    );
    setPm(next);
  }

  const transformed = transformForPm(code, pm);

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
      <div className="flex items-center justify-between gap-3 border-b border-white/8 bg-white/[0.02] px-4 py-2">
        <div className="flex items-center gap-1">
          {PMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleSelect(p)}
              className={
                p === pm
                  ? "rounded px-2 py-0.5 font-mono text-xs font-medium text-zinc-100 bg-white/8"
                  : "rounded px-2 py-0.5 font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              }
            >
              {p}
            </button>
          ))}
        </div>
        <CopyButton
          text={transformed}
          label="Copy code"
          copiedLabel="Copied"
          iconOnly
        />
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono">
          <Highlight code={transformed} />
        </code>
      </pre>
    </div>
  );
}
