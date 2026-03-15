import type { PropsWithChildren } from "react";

export function FeatureGrid({ children }: PropsWithChildren) {
  return <div className="feature-grid">{children}</div>;
}
