"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { MythCategory } from "@/lib/i18n/health-myths";
import { useLanguage } from "@/lib/i18n/language-context";

export interface MythCategoryProgress {
  total: number;
  answered: number;
}

export interface MythCategoryFilterProps {
  categories: MythCategory[];
  activeCategory: string;
  onSelect: (categorySlug: string) => void;
  /** Per-category totals and answered counts, shown as a rectangular tally chip. */
  progress?: Record<string, MythCategoryProgress>;
  className?: string;
}

const FADE = "2.5rem";

/**
 * One left-aligned underline band, the same pattern as the section tabs in
 * the guides. It stays on a single horizontal row: when the labels exceed the
 * column width the row scrolls sideways and the cut-off edge fades out, with
 * desktop chevrons paging the row.
 */
export function MythCategoryFilter({
  categories,
  activeCategory,
  onSelect,
  progress,
  className,
}: MythCategoryFilterProps) {
  const { t } = useLanguage();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const start = el.scrollLeft > 1;
    const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setEdges((prev) =>
      prev.start === start && prev.end === end ? prev : { start, end },
    );
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [measure]);

  // Keep the chosen category fully visible, without moving the page itself.
  useEffect(() => {
    const el = scrollerRef.current;
    const active = el?.querySelector<HTMLElement>("[aria-pressed='true']");
    if (!el || !active) return;
    const left = active.offsetLeft;
    const right = left + active.offsetWidth;
    const pad = 40;
    let target: number | null = null;
    if (left - pad < el.scrollLeft) target = Math.max(0, left - pad);
    else if (right + pad > el.scrollLeft + el.clientWidth)
      target = right + pad - el.clientWidth;
    if (target === null) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollTo({ left: target, behavior: reduced ? "auto" : "smooth" });
  }, [activeCategory]);

  const mask =
    edges.start || edges.end
      ? `linear-gradient(to right, ${edges.start ? "transparent" : "#000"}, #000 ${edges.start ? FADE : "0px"}, #000 calc(100% - ${edges.end ? FADE : "0px"}), ${edges.end ? "transparent" : "#000"})`
      : undefined;
  const maskStyle: CSSProperties | undefined = mask
    ? { maskImage: mask, WebkitMaskImage: mask }
    : undefined;

  const page = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollBy({
      left: direction * el.clientWidth * 0.6,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  // Mouse-only paging; touch swipes and keyboard focus already scroll the row.
  const edgeButton =
    "absolute top-0 bottom-px hidden w-10 items-center text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-foreground pointer-fine:flex motion-reduce:transition-none";

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollerRef}
        role="group"
        aria-label={t.quiz.filterAriaLabel}
        style={maskStyle}
        className="flex gap-5 overflow-x-auto shadow-[inset_0_-1px_0_var(--color-border)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug;
          const tally = progress?.[cat.slug];
          const hasAnswered = Boolean(tally && tally.answered > 0);
          return (
            <button
              key={cat.slug}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(cat.slug)}
              className={cn(
                "flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 pb-2.5 pt-2 text-sm font-semibold transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none",
                isActive
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <span>{cat.label}</span>
              {tally && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-md px-1.5 py-0.5 font-mono text-[11px] tabular-nums transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none",
                    hasAnswered
                      ? "border border-sapphire-border/80 bg-sapphire-soft font-semibold text-sapphire"
                      : "bg-muted font-medium text-muted-foreground",
                  )}
                >
                  {hasAnswered ? `${tally.answered}/${tally.total}` : tally.total}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {edges.start && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => page(-1)}
          className={cn(edgeButton, "left-0 justify-start bg-linear-to-r from-background from-50% to-transparent")}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
      )}
      {edges.end && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => page(1)}
          className={cn(edgeButton, "right-0 justify-end bg-linear-to-l from-background from-50% to-transparent")}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
