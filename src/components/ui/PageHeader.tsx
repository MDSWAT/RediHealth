import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/cn";

export interface PageHeaderProps {
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  align?: "start" | "center";
  /** Optional content rendered before the page title (back link, meta row, notice, or route mark). */
  above?: ReactNode;
  /** Optional content rendered below actions/lead (secondary note or view switcher). */
  below?: ReactNode;
  titleLang?: string;
  leadLang?: string;
  className?: string;
  ref?: Ref<HTMLElement>;
}

/**
 * Shared public page header: one title size (`text-page`), one lead (`text-lead` at
 * `--measure-lead`) 12px (`mt-3`) under it, 20px (`mt-5`) above the action row,
 * calm top breathing room (`pt-6 sm:pt-10`), and no enclosing grey/white band.
 */
export function PageHeader({
  title,
  lead,
  actions,
  align = "start",
  above,
  below,
  titleLang,
  leadLang,
  className,
  ref,
}: PageHeaderProps) {
  const centered = align === "center";
  return (
    <header
      ref={ref}
      className={cn(
        "pt-6 sm:pt-10",
        centered && "mx-auto max-w-2xl text-center",
        className,
      )}
    >
      {above ? <div className={cn("mb-3", centered && "flex justify-center")}>{above}</div> : null}
      <div className={cn(!centered && actions ? "lg:flex lg:items-end lg:justify-between lg:gap-8" : undefined)}>
        <div className="min-w-0 flex-1">
          <h1 lang={titleLang} className="text-balance text-page text-foreground">
            {title}
          </h1>
          {lead ? (
            <p
              lang={leadLang}
              className={cn(
                "mt-3 max-w-3xl text-pretty text-lead text-muted-foreground",
                centered && "mx-auto",
              )}
            >
              {lead}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div
            className={cn(
              "btn-row mt-5 flex flex-wrap gap-3",
              centered ? "justify-center" : "lg:mt-0 lg:shrink-0",
            )}
          >
            {actions}
          </div>
        ) : null}
      </div>
      {below}
    </header>
  );
}
