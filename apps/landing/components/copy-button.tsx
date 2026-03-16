"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type CopyButtonProps =
  | {
      text: string;
      label: string;
      copiedLabel?: string;
      className?: string;
      value?: never;
      src?: never;
    }
  | {
      value: string;
      src?: string;
      text?: never;
      label?: string;
      copiedLabel?: string;
      className?: string;
    };

export function CopyButton({
  text,
  value,
  label,
  copiedLabel = "Copied",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const copyValue = text ?? value;
  const copyLabel = label ?? "Copy";

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopied(false);
    }, 1600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copied]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(copyValue);
    setCopied(true);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted",
        className
      )}
      aria-label={copyLabel}
      title={copyLabel}
    >
      {copied ? copiedLabel : copyLabel}
    </button>
  );
}
