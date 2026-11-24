import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon, ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * One centred reading column, the same width on every health reading route. Inside it the
 * reading measure matches the column, so text, cards and headings share both edges instead of
 * leaving an empty strip on the right.
 */
export const HEALTH_ARTICLE_CONTAINER_CLASS = "mx-auto w-full max-w-[44rem] [--measure-reading:44rem]";

/** Elderly-first WCAG 2.2 AAA body prose scale: 18px base, 1.65 leading, 44rem unified reading measure matching the centred column. */
export const HEALTH_ARTICLE_PROSE_CLASS =
  "max-w-(--measure-reading) text-reading text-foreground";

/** Consistent section heading scale and scroll offset under the top bar. */
export const HEALTH_ARTICLE_SECTION_H2_CLASS =
  "scroll-mt-6 text-section font-semibold leading-snug text-foreground";

export interface HealthArticleShellProps {
  children: ReactNode;
  /** @deprecated The side table of contents was removed; render HealthArticleToc inside the column instead. */
  toc?: HealthArticleTocProps;
  className?: string;
}

/**
 * Shared outer shell: one centred max-w-3xl reading column across topics, articles and news.
 * The table of contents is no longer a side column; pages show it inside the column as the
 * collapsible HealthArticleToc, under the header.
 */
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
    <nav aria-label={navAriaLabel ?? label} className={cn("mb-3 print:hidden", className)}>
      <Link
        href={href}
        className="group -ml-2.5 inline-flex min-h-12 max-w-full items-center gap-2 rounded-lg px-2.5 text-meta font-semibold text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:whitespace-nowrap"
      >
        <ArrowRightIcon
          className="h-4 w-4 shrink-0 rotate-180 transition-transform duration-(--dur-fast) ease-(--ease-out-calm) group-hover:-translate-x-0.5 motion-reduce:transition-none"
          aria-hidden="true"
        />
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
  /** Optional framed documentary photograph shown in an asymmetric split beside the headline on core guides. */
  media?: ReactNode;
  actions?: ReactNode;
  afterActions?: ReactNode;
  reviewNote?: string;
  className?: string;
}

/**
 * Dedicated Swiss-editorial reading header for the 44rem column across health guides,
 * topic summaries, detailed articles, and news stories. Keeps the H1 and lead at full
 * uncrushed measure above a cleanly separated utility action bar.
 */
export function HealthArticleHeader({
  title,
  titleLang,
  lead,
  leadLang,
  languageNotice,
  noticeLang,
  meta,
  media,
  actions,
  afterActions,
  reviewNote,
  className,
}: HealthArticleHeaderProps) {
  return (
    <header className={cn("border-b border-border pb-6 pt-1 sm:pb-7 print:pb-4", className)}>
      {languageNotice && (
        <p
          role="note"
          lang={noticeLang}
          className="mb-4 max-w-(--measure-reading) rounded-xl border border-sand-line/85 bg-sand/50 px-4 py-3 text-body text-foreground dark:border-white/12 dark:bg-white/[0.04]"
        >
          {languageNotice}
        </p>
      )}

      <div
        className={cn(
          media
            ? "grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_min(13rem,32%)] md:gap-7"
            : undefined,
        )}
      >
        <div className="min-w-0">
          {meta && (
            <div className="mb-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-meta font-medium text-muted-foreground tabular-nums print:hidden">
              {meta}
            </div>
          )}

          <h1
            lang={titleLang}
            className="min-w-0 text-balance text-page text-foreground [overflow-wrap:break-word]"
          >
            {title}
          </h1>

          {lead && (
            <p
              lang={leadLang}
              className="mt-3 max-w-(--measure-reading) text-pretty text-lead text-muted-foreground"
            >
              {lead}
            </p>
          )}
        </div>

        {media ? <div className="min-w-0 print:hidden">{media}</div> : null}
      </div>

      {actions && (
        <div className="mt-5 border-t border-border/75 pt-4 print:hidden [&:not(:has(*))]:hidden">
          {actions}
        </div>
      )}

      {reviewNote && (
        <p className="mt-4 max-w-(--measure-reading) text-meta leading-relaxed text-muted-foreground">
          {reviewNote}
        </p>
      )}

      {afterActions && <div className="mt-4 print:hidden">{afterActions}</div>}
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
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-5 py-3 text-body font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
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
                className="group flex min-h-11 items-baseline gap-3 py-2 text-body font-medium text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire focus-visible:text-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                <span
                  aria-hidden="true"
                  className="w-6 shrink-0 text-meta font-semibold tabular-nums text-muted-foreground"
                >
                  {index + 1}.
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
        className="text-section font-semibold text-foreground"
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
                    "inline text-title leading-snug transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire motion-reduce:transition-none",
                    item.emphasized ? "font-semibold" : "font-medium",
                  )}
                >
                  {item.title}
                </span>
                {item.meta && (
                  <span className="mt-1 block text-meta leading-snug text-muted-foreground">
                    {item.meta}
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
