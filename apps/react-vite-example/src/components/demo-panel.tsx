import type { PropsWithChildren, ReactNode } from "react";

interface DemoPanelProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function DemoPanel({
  actions,
  children,
  description,
  eyebrow,
  title,
}: DemoPanelProps) {
  return (
    <section className="demo-panel">
      <div className="demo-panel__header">
        <p className="demo-panel__eyebrow">{eyebrow}</p>
        <div className="demo-panel__headline">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {actions ? <div className="demo-panel__actions">{actions}</div> : null}
      </div>
      <div className="demo-panel__body">{children}</div>
    </section>
  );
}
