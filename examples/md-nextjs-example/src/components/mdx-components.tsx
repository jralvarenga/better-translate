import type { ReactNode } from "react";

interface CalloutProps {
  type?: "info" | "tip" | "warning";
  children: ReactNode;
}

export function Callout({ type = "info", children }: CalloutProps) {
  const styles = {
    info: "border-blue-500/30 bg-blue-500/5 text-blue-200",
    tip: "border-green-500/30 bg-green-500/5 text-green-200",
    warning: "border-amber-500/30 bg-amber-500/5 text-amber-200",
  };

  const labels = {
    info: "Info",
    tip: "Tip",
    warning: "Warning",
  };

  return (
    <div className={`rounded-lg border p-4 my-4 ${styles[type]}`}>
      <div className="text-xs font-mono font-semibold uppercase tracking-wide opacity-70 mb-1">
        {labels[type]}
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

interface CardProps {
  title: string;
  description: string;
}

export function Card({ title, description }: CardProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 my-3">
      <div className="font-mono text-sm font-semibold text-foreground">
        {title}
      </div>
      <div className="text-sm text-muted mt-1">{description}</div>
    </div>
  );
}

export const mdxComponents = { Callout, Card };
