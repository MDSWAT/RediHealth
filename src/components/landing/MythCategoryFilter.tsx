"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { motion } from "motion/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { MythCategory } from "@/lib/i18n/health-myths";
import { prefersCalmOrReducedMotion } from "@/lib/comfort-preferences";
import { useLanguage } from "@/lib/i18n/language-context";
import { DURATION, EASE_OUT, useCalmReducedMotion } from "@/lib/motion/tokens";

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
 * the guides. It is one row that scrolls sideways, its cut-off edge fading
 * out so every category is reachable cleanly. Its colours are set for the
 * sapphire-soft quiz ground, the only place it is used.
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
  const markerId = useId();
  const calmMotion = useCalmReducedMotion();

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
    const reduced = prefersCalmOrReducedMotion();
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
    const reduced = prefersCalmOrReducedMotion();
    el.scrollBy({
      left: direction * el.clientWidth * 0.6,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  // Mouse-only paging; touch swipes and keyboard focus already scroll the row.
  const edgeButton =
    "absolute top-0 bottom-px hidden w-10 items-center from-sapphire-soft from-50% to-transparent text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:text-foreground pointer-fine:flex motion-reduce:transition-none dark:from-ink-900 dark:text-mist dark:hover:text-paper";

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollerRef}
        role="group"
        aria-label={t.quiz.filterAriaLabel}
        style={maskStyle}
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-col lg:items-start lg:gap-0 lg:overflow-visible lg:border-l lg:border-sapphire-border/80 lg:pb-0 dark:lg:border-ink-800 [&::-webkit-scrollbar]:hidden"
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
                "relative flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-(--radius-control) border px-3.5 py-2 text-sm transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none lg:-ml-px lg:min-h-10 lg:rounded-none lg:border-0 lg:border-l-2 lg:bg-transparent lg:px-0 lg:py-1.5 lg:pl-4 lg:text-[15px] dark:focus-visible:ring-paper",
                isActive
                  ? "border-sapphire bg-sapphire font-semibold text-paper dark:border-paper dark:bg-paper dark:text-ink-950 lg:border-transparent lg:bg-transparent lg:text-foreground dark:lg:border-transparent dark:lg:bg-transparent dark:lg:text-paper"
                  : "border-border-control bg-card font-medium text-foreground hover:border-sapphire/40 hover:text-foreground active:text-foreground dark:border-ink-700 dark:bg-ink-900 dark:text-mist dark:hover:border-ink-500 dark:hover:text-paper dark:active:text-paper lg:border-transparent lg:bg-transparent lg:text-muted-foreground dark:lg:border-transparent dark:lg:bg-transparent",
              )}
            >
              {/* From lg the active rule glides down the list to the chosen category. */}
              {isActive && (
                <motion.span
                  aria-hidden="true"
                  layoutId={`myth-category-marker-${markerId}`}
                  transition={calmMotion ? { duration: 0 } : { duration: DURATION.base, ease: EASE_OUT }}
                  className="pointer-events-none absolute inset-y-0 -left-0.5 hidden w-0.5 bg-foreground lg:block dark:bg-paper"
                />
              )}
              <span>{cat.label}</span>
              {hasAnswered && tally && (
                <span className="hidden text-meta font-normal tabular-nums text-sapphire dark:text-sapphire-border lg:inline">
                  {tally.answered}/{tally.total}
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
          className={cn(edgeButton, "left-0 justify-start bg-linear-to-r")}
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
          className={cn(edgeButton, "right-0 justify-end bg-linear-to-l")}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
