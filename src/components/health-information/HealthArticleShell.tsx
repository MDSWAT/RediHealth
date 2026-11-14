import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon, ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/** Unified centered editorial reading container width across every health reading route. */
export const HEALTH_ARTICLE_CONTAINER_CLASS = "mx-auto w-full max-w-3xl";

/** Elderly-first WCAG 2.2 AAA body prose scale: 18px base, 1.75 leading, <= 65ch measure. */
export const HEALTH_ARTICLE_PROSE_CLASS =
  "max-w-[65ch] text-[1.125rem] leading-[1.75] text-foreground";

/** Consistent section heading scale and scroll offset under the top bar. */
export const HEALTH_ARTICLE_SECTION_H2_CLASS =
  "scroll-mt-28 text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-[1.625rem]";

export interface HealthArticleShellProps {
  children: ReactNode;
  className?: string;
}

/** Shared outer shell enforcing one identical max-w-3xl reading column across topics, articles, and news. */
export function HealthArticleShell({ children, className }: HealthArticleShellProps) {
  return (
    <div className={cn("bg-background py-8 sm:py-12 print:py-4", className)}>
      <Container>
        <div className={HEALTH_ARTICLE_CONTAINER_CLASS} data-health-article-column>
          {children}
        </div>
      </Container>
    </div>
  );
}

export interface HealthArticleBackLinkProps {
  href: string;
  label: string;
  navAriaLabel?: string;
  className?: string;
}

/** Minimum 48px high-contrast back navigation above the article title. */
export function HealthArticleBackLink({
  href,
  label,
  navAriaLabel,
  className,
}: HealthArticleBackLinkProps) {
  return (
    <nav aria-label={navAriaLabel ?? label} className={cn("mb-6 print:hidden", className)}>
      <Link
        href={href}
        className="-ml-2 inline-flex min-h-12 items-center gap-2 whitespace-nowrap rounded-lg px-2 text-base font-medium text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft/50 hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowRightIcon className="h-4 w-4 shrink-0 rotate-180" aria-hidden="true" />
        <span>{label}</span>
      </Link>
    </nav>
  );
}

export interface HealthArticleHeaderProps {
  title: string;
  titleLang?: string;
  lead?: string;
  leadLang?: string;
  languageNotice?: string | null;
  noticeLang?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  reviewNote?: string;
  className?: string;
}

/** Unified calm header rhythm: optional language notice, metadata, H1 without icons, high-contrast lead, actions. */
export function HealthArticleHeader({
  title,
  titleLang,
  lead,
  leadLang,
  languageNotice,
  noticeLang,
  meta,
  actions,
  reviewNote,
  className,
}: HealthArticleHeaderProps) {
  return (
    <header className={cn("border-b border-border pb-7 sm:pb-8", className)}>
      {languageNotice && (
        <p
          role="note"
          lang={noticeLang}
          className="mb-5 rounded-r-lg border-l-2 border-sapphire bg-surface-subtle/70 py-2.5 pl-4 pr-3 text-base leading-relaxed text-foreground"
        >
          {languageNotice}
        </p>
      )}

      {meta && (
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground tabular-nums print:hidden">
          {meta}
        </div>
      )}

      <h1
        lang={titleLang}
        className="text-balance text-3xl font-semibold leading-[1.18] tracking-tight text-foreground sm:text-[2.375rem]"
      >
        {title}
      </h1>

      {lead && (
        <p
          lang={leadLang}
          className="mt-4 max-w-[65ch] text-pretty text-lg leading-[1.65] text-foreground sm:text-[1.25rem]"
        >
          {lead}
        </p>
      )}

      {reviewNote && (
        <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
          {reviewNote}
        </p>
      )}

      {actions && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          {actions}
        </div>
      )}
    </header>
  );
}

export interface HealthArticleTocItem {
  href: string;
  label: string;
}

export interface HealthArticleTocProps {
  title: string;
  ariaLabel: string;
  items: HealthArticleTocItem[];
  className?: string;
}

/** Progressive-disclosure table of contents so elderly readers see clean content first, while keeping all anchor links in SSR HTML. */
export function HealthArticleToc({
  title,
  ariaLabel,
  items,
  className,
}: HealthArticleTocProps) {
  if (items.length === 0) return null;

  return (
    <details
      className={cn(
        "group/toc mt-8 rounded-xl border border-border bg-card print:hidden",
        className,
      )}
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-5 py-3 text-base font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <ChevronDownIcon
          className="h-5 w-5 shrink-0 text-muted-foreground transition-[transform,color] duration-[var(--dur-base)] ease-[var(--ease-out-calm)] group-open/toc:rotate-180 group-open/toc:text-sapphire motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>

      {/* Shown only while open, so the entrance replays on every opening. */}
      <nav aria-label={ariaLabel} className="swap-in border-t border-border px-5 py-2.5">
        <ol className="divide-y divide-border/70">
          {items.map((item, index) => (
            <li
              key={item.href}
              className="list-in"
              style={{ "--i": index } as CSSProperties}
            >
              <a
                href={item.href}
                className="group flex min-h-11 items-baseline gap-3 py-2 text-base font-medium text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire focus-visible:text-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                <span
                  aria-hidden="true"
                  className="w-6 shrink-0 text-sm font-semibold tabular-nums text-muted-foreground"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}

export interface HealthArticleRelatedItem {
  key: string;
  href: string;
  title: string;
  titleLang?: string;
  meta?: string;
  emphasized?: boolean;
}

export interface HealthArticleRelatedListProps {
  heading: string;
  headingId?: string;
  ariaLabel?: string;
  items: HealthArticleRelatedItem[];
  className?: string;
}

/** Shared single-column hairline related reading list matching across topics, summaries, articles, and news. */
export function HealthArticleRelatedList({
  heading,
  headingId,
  ariaLabel,
  items,
  className,
}: HealthArticleRelatedListProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-labelledby={headingId}
      aria-label={headingId ? undefined : ariaLabel}
      className={cn("mt-12 print:hidden", className)}
    >
      <h2
        id={headingId}
        className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
      >
        {heading}
      </h2>

      <ul className="mt-4 divide-y divide-border border-y border-border">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              className="press-row group flex min-h-14 items-center justify-between gap-4 py-3.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="min-w-0">
                <span
                  lang={item.titleLang}
                  className={cn(
                    "inline text-[1.0625rem] leading-snug transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire motion-reduce:transition-none sm:text-lg",
                    item.emphasized ? "font-semibold" : "font-medium",
                  )}
                >
                  {item.title}
                </span>
                {item.meta && (
                  <span className="mt-1 block text-sm leading-snug text-muted-foreground">
                    {item.meta}
                  </span>
                )}
              </span>

              <ArrowRightIcon
                className="h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire motion-reduce:transition-none"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
