import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-highlight";
import { cn } from "@/lib/utils";

type PreCodeElement = React.ReactElement<{
  children?: string;
  className?: string;
  metastring?: string;
  __raw__?: string;
  __src__?: string;
}>;

function slugifyHeading(value: React.ReactNode) {
  return React.Children.toArray(value)
    .flatMap((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }

      if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
        return React.Children.toArray(child.props.children).join("");
      }

      return "";
    })
    .join("")
    .replace(/ /g, "-")
    .replace(/'/g, "")
    .replace(/\?/g, "")
    .toLowerCase();
}

function isInternalHref(href?: string) {
  return Boolean(href && (href.startsWith("/") || href.startsWith("#")));
}

export const mdxComponents = {
  h1: ({ className, ...props }: React.ComponentPropsWithoutRef<"h1">) => (
    <h1
      className={cn(
        "mt-2 scroll-m-28 text-3xl font-bold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.ComponentPropsWithoutRef<"h2">) => (
    <h2
      id={slugifyHeading(props.children)}
      className={cn(
        "mt-10 scroll-m-28 text-xl font-medium tracking-tight first:mt-0 lg:mt-12 border-b border-white/8 pb-3 text-foreground",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.ComponentPropsWithoutRef<"h3">) => (
    <h3
      className={cn(
        "mt-12 scroll-m-28 text-lg font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: React.ComponentPropsWithoutRef<"h4">) => (
    <h4
      className={cn(
        "mt-8 scroll-m-28 text-base font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }: React.ComponentPropsWithoutRef<"h5">) => (
    <h5
      className={cn(
        "mt-8 scroll-m-28 text-base font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  h6: ({ className, ...props }: React.ComponentPropsWithoutRef<"h6">) => (
    <h6
      className={cn(
        "mt-8 scroll-m-28 text-base font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  a: ({ className, href, ...props }: React.ComponentPropsWithoutRef<"a">) => {
    const linkClassName = cn(
      "text-foreground/80 underline decoration-white/30 hover:decoration-white/70 underline-offset-4 transition-colors",
      className,
    );

    if (isInternalHref(href)) {
      return <Link className={linkClassName} href={href ?? "#"} {...props} />;
    }

    return <a className={linkClassName} href={href} {...props} />;
  },
  p: ({ className, ...props }: React.ComponentPropsWithoutRef<"p">) => (
    <p
      className={cn(
        "leading-relaxed text-muted-foreground [&:not(:first-child)]:mt-6",
        className,
      )}
      {...props}
    />
  ),
  strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong
      className={cn("font-medium text-foreground", className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.ComponentPropsWithoutRef<"ul">) => (
    <ul
      className={cn("my-6 ml-6 list-disc text-muted-foreground", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.ComponentPropsWithoutRef<"ol">) => (
    <ol
      className={cn("my-6 ml-6 list-decimal text-muted-foreground", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.ComponentPropsWithoutRef<"li">) => (
    <li className={cn("mt-2", className)} {...props} />
  ),
  blockquote: ({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className={cn(
        "mt-6 border-l border-white/25 not-italic text-muted-foreground bg-white/[0.02] rounded-r-md py-1 pl-6",
        className,
      )}
      {...props}
    />
  ),
  img: ({ className, alt, ...props }: React.ComponentPropsWithoutRef<"img">) => (
    <img className={cn("rounded-md", className)} alt={alt} {...props} />
  ),
  hr: (props: React.ComponentPropsWithoutRef<"hr">) => (
    <hr className="my-4 border-white/10 md:my-8" {...props} />
  ),
  table: ({ className, ...props }: React.ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 w-full overflow-y-auto rounded-xl border border-border/80">
      <table
        className={cn(
          "relative w-full overflow-hidden border-none text-sm [&_tbody_tr:last-child]:border-b-0",
          className,
        )}
        {...props}
      />
    </div>
  ),
  tr: ({ className, ...props }: React.ComponentPropsWithoutRef<"tr">) => (
    <tr className={cn("m-0 border-b border-border/70", className)} {...props} />
  ),
  th: ({ className, ...props }: React.ComponentPropsWithoutRef<"th">) => (
    <th
      className={cn(
        "px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.ComponentPropsWithoutRef<"td">) => (
    <td
      className={cn(
        "px-4 py-2 text-left whitespace-nowrap [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  pre: ({
    className,
    children,
    ...props
  }: React.ComponentPropsWithoutRef<"pre"> & {
    children?: PreCodeElement;
  }) => {
    const childClassName = children?.props?.className ?? "";
    const metaString = children?.props?.metastring ?? "";
    const language = childClassName.replace("language-", "") || "tsx";
    const code = String(children?.props?.children ?? "").replace(/\n$/, "");

    if (!code) {
      return (
        <pre
          className={cn(
            "min-w-0 overflow-x-auto overflow-y-auto px-4 py-3.5 outline-none",
            className,
          )}
          {...props}
        >
          {children}
        </pre>
      );
    }

    return (
      <figure className="mt-6">
        <CodeBlock
          code={code}
          filename={language}
          showLineNumbers={!metaString.includes("hideLineNumbers")}
        />
      </figure>
    );
  },
  figure: ({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<"figure">) => (
    <figure className={cn(className)} {...props} />
  ),
  figcaption: ({
    className,
    ...props
  }: React.ComponentPropsWithoutRef<"figcaption">) => (
    <figcaption
      className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
  code: ({
    className,
    __raw__,
    __src__,
    ...props
  }: React.ComponentPropsWithoutRef<"code"> & {
    __raw__?: string;
    __src__?: string;
  }) => {
    if (typeof props.children === "string") {
      return (
        <code
          className={cn(
            "relative rounded-md bg-white/8 border border-white/10 px-1.5 py-0.5 font-mono text-[0.8rem] break-words outline-none text-foreground/90",
            className,
          )}
          {...props}
        />
      );
    }

    return (
      <>
        {__raw__ ? (
          <div className="mb-2 flex justify-end">
            <CopyButton
              value={__raw__}
              label="Copy code"
              copiedLabel="Copied"
              className="inline-flex items-center rounded-full border border-border/80 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground transition hover:bg-muted"
            />
          </div>
        ) : null}
        <code data-source={__src__} {...props} />
      </>
    );
  },
  Image: ({
    src,
    className,
    width,
    height,
    alt,
    ...props
  }: React.ComponentPropsWithoutRef<"img">) => (
    <Image
      className={cn("mt-6 rounded-md border border-border/80", className)}
      src={(src as string) || ""}
      width={Number(width)}
      height={Number(height)}
      alt={alt || ""}
      {...props}
    />
  ),
  Link: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn("font-medium underline underline-offset-4", className)}
      {...props}
    />
  ),
  Button,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
};

export const docsComponents = mdxComponents;
