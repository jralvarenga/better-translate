import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  h1: ({ className, ...props }: React.ComponentProps<"h1">) => (
    <h1
      className={cn(
        "mt-2 scroll-m-28 text-3xl font-bold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.ComponentProps<"h2">) => (
    <h2
      id={slugifyHeading(props.children)}
      className={cn(
        "mt-10 scroll-m-28 text-xl font-medium tracking-tight first:mt-0 lg:mt-12",
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.ComponentProps<"h3">) => (
    <h3
      className={cn(
        "mt-12 scroll-m-28 text-lg font-medium tracking-tight",
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: React.ComponentProps<"h4">) => (
    <h4
      className={cn(
        "mt-8 scroll-m-28 text-base font-medium tracking-tight",
        className
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }: React.ComponentProps<"h5">) => (
    <h5
      className={cn(
        "mt-8 scroll-m-28 text-base font-medium tracking-tight",
        className
      )}
      {...props}
    />
  ),
  h6: ({ className, ...props }: React.ComponentProps<"h6">) => (
    <h6
      className={cn(
        "mt-8 scroll-m-28 text-base font-medium tracking-tight",
        className
      )}
      {...props}
    />
  ),
  a: ({
    className,
    href,
    ...props
  }: React.ComponentProps<"a">) => {
    const linkClassName = cn(
      "font-medium underline underline-offset-4",
      className
    );

    if (isInternalHref(href)) {
      return <Link className={linkClassName} href={href ?? "#"} {...props} />;
    }

    return <a className={linkClassName} href={href} {...props} />;
  },
  p: ({ className, ...props }: React.ComponentProps<"p">) => (
    <p
      className={cn(
        "leading-relaxed text-muted-foreground [&:not(:first-child)]:mt-6",
        className
      )}
      {...props}
    />
  ),
  strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className={cn("font-medium text-foreground", className)} {...props} />
  ),
  ul: ({ className, ...props }: React.ComponentProps<"ul">) => (
    <ul className={cn("my-6 ml-6 list-disc text-muted-foreground", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.ComponentProps<"ol">) => (
    <ol className={cn("my-6 ml-6 list-decimal text-muted-foreground", className)} {...props} />
  ),
  li: ({ className, ...props }: React.ComponentProps<"li">) => (
    <li className={cn("mt-2", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.ComponentProps<"blockquote">) => (
    <blockquote
      className={cn("mt-6 border-l-2 border-border pl-6 italic text-muted-foreground", className)}
      {...props}
    />
  ),
  img: ({ className, alt, ...props }: React.ComponentProps<"img">) => (
    <img className={cn("rounded-md", className)} alt={alt} {...props} />
  ),
  hr: (props: React.ComponentProps<"hr">) => (
    <hr className="my-4 border-border/60 md:my-8" {...props} />
  ),
  table: ({ className, ...props }: React.ComponentProps<"table">) => (
    <div className="my-6 w-full overflow-y-auto rounded-xl border border-border/80">
      <table
        className={cn(
          "relative w-full overflow-hidden border-none text-sm [&_tbody_tr:last-child]:border-b-0",
          className
        )}
        {...props}
      />
    </div>
  ),
  tr: ({ className, ...props }: React.ComponentProps<"tr">) => (
    <tr className={cn("m-0 border-b border-border/70", className)} {...props} />
  ),
  th: ({ className, ...props }: React.ComponentProps<"th">) => (
    <th
      className={cn(
        "px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.ComponentProps<"td">) => (
    <td
      className={cn(
        "px-4 py-2 text-left whitespace-nowrap [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, children, ...props }: React.ComponentProps<"pre"> & {
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
            className
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
  figure: ({ className, ...props }: React.ComponentProps<"figure">) => (
    <figure className={cn(className)} {...props} />
  ),
  figcaption: ({ className, ...props }: React.ComponentProps<"figcaption">) => (
    <figcaption
      className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground",
        className
      )}
      {...props}
    />
  ),
  code: ({
    className,
    __raw__,
    __src__,
    ...props
  }: React.ComponentProps<"code"> & {
    __raw__?: string;
    __src__?: string;
  }) => {
    if (typeof props.children === "string") {
      return (
        <code
          className={cn(
            "relative rounded-md bg-accent px-[0.3rem] py-[0.2rem] font-mono text-[0.8rem] break-words outline-none",
            className
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
  }: React.ComponentProps<"img">) => (
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
