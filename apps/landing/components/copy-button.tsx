"use client";

import { useEffect, useState } from "react";
import { RiFileCopy2Line, RiCheckLine } from "@remixicon/react";
import { cn } from "@/lib/utils";

type CopyButtonProps =
  | {
      text: string;
      label: string;
      copiedLabel?: string;
      className?: string;
      iconOnly?: boolean;
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
      iconOnly?: boolean;
    };

export function CopyButton({
  text,
  value,
  label,
  copiedLabel = "Copied",
  className,
  iconOnly = false,
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

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "flex size-7 items-center justify-center rounded-md text-zinc-500 transition hover:bg-white/8 hover:text-zinc-300",
          copied && "text-zinc-300",
          className,
        )}
        aria-label={copied ? copiedLabel : copyLabel}
        title={copied ? copiedLabel : copyLabel}
      >
        {copied ? (
          <RiCheckLine className="size-3.5" />
        ) : (
          <RiFileCopy2Line className="size-3.5" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted",
        className,
      )}
      aria-label={copyLabel}
      title={copyLabel}
    >
      {copied ? copiedLabel : copyLabel}
    </button>
  );
}
