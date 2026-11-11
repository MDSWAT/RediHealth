"use client";

import { useRef, useState } from "react";
import type { HealthMyth } from "@/lib/i18n/health-myths";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/language-context";

export type MythResult = "correct" | "wrong";

export interface MythCardCarouselProps {
  myths: HealthMyth[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  children: React.ReactNode;
  /** Answer outcome per myth id, used to colour the progress segments. */
  results?: Record<string, MythResult>;
  /** Right-aligned slot in the progress row (score). */
  aside?: React.ReactNode;
  className?: string;
}

const navButton =
  "press-row inline-flex min-h-10 min-w-10 items-center justify-center rounded-(--radius-control) border border-sapphire-border/80 bg-card/85 text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:border-sapphire hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:border-transparent disabled:bg-transparent disabled:text-muted-foreground/45 motion-reduce:transition-none dark:border-white/20 dark:bg-ink-800 dark:text-paper dark:hover:bg-white/10 dark:focus-visible:ring-paper dark:disabled:border-transparent dark:disabled:bg-transparent dark:disabled:text-mist/40";

const RESULT_FILL: Record<MythResult, string> = {
  correct: "inset-0 bg-sapphire dark:bg-sapphire-border",
  wrong: "inset-0 bg-ink-950/65 dark:bg-paper/65",
};

/**
 * Editorial frame around one myth card: a single compact navigation strip with a tabular
 * counter, thin interactive scrub segments, and crisp previous/next buttons, above the card
 * which settles in with `.myth-card-swap`.
 */
export function MythCardCarousel({
  myths,
  currentIndex,
  onIndexChange,
  children,
  results = {},
  aside,
  className,
}: MythCardCarouselProps) {
  const { t } = useLanguage();
  const touchStartX = useRef<number | null>(null);
  const total = myths.length;

  const [navState, setNavState] = useState<{
    index: number;
    dir: "forward" | "back";
  }>({ index: currentIndex, dir: "forward" });

  if (navState.index !== currentIndex) {
    setNavState({
      index: currentIndex,
      dir: currentIndex < navState.index ? "back" : "forward",
    });
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < total - 1) onIndexChange(currentIndex + 1);
      else if (diff < 0 && currentIndex > 0) onIndexChange(currentIndex - 1);
    }
    touchStartX.current = null;
  };

  const activeMythKey = myths[currentIndex]?.id ?? String(currentIndex);

  return (
    <div className={cn("space-y-3", className)} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="flex items-center gap-4">
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="text-meta tabular-nums text-muted-foreground dark:text-mist" aria-live="polite">
            <span className="sr-only">{t.quiz.mythProgressPrefix} </span>
            <span className="font-semibold text-foreground dark:text-paper">{currentIndex + 1}</span>
            <span aria-hidden="true" className="mx-1 text-muted-foreground/60">
              /
            </span>
            <span className="sr-only"> {t.quiz.mythProgressOf} </span>
            <span>{total}</span>
          </span>
          {aside}
        </div>

        {/* Scrub segments: full 44px vertical touch envelope around each hairline bar. */}
        <div className="-my-2 flex min-w-0 flex-1 gap-1.5">
          {myths.map((m, idx) => {
            const result = results[m.id];
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onIndexChange(idx)}
                aria-label={`${t.quiz.mythProgressPrefix} ${idx + 1}`}
                aria-current={isCurrent ? "step" : undefined}
                className="group/seg flex min-h-11 flex-1 items-center py-2 focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "relative block w-full overflow-hidden rounded-full transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none group-focus-visible/seg:ring-2 group-focus-visible/seg:ring-ring dark:group-focus-visible/seg:ring-paper",
                    isCurrent
                      ? "h-1.5 bg-foreground dark:bg-paper"
                      : "h-1 bg-sapphire-border/90 group-hover/seg:bg-foreground/45 dark:bg-white/25 dark:group-hover/seg:bg-white/50",
                  )}
                >
                  <span
                    className={cn(
                      "absolute origin-left transition-transform duration-(--dur-slow) ease-(--ease-out-calm) motion-reduce:transition-none",
                      result ? RESULT_FILL[result] : "scale-x-0",
                    )}
                  />
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => currentIndex > 0 && onIndexChange(currentIndex - 1)}
            disabled={currentIndex === 0}
            className={navButton}
            aria-label={t.quiz.prevMythAria}
            aria-keyshortcuts="ArrowLeft"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => currentIndex < total - 1 && onIndexChange(currentIndex + 1)}
            disabled={currentIndex === total - 1}
            className={navButton}
            aria-label={t.quiz.nextMythAria}
            aria-keyshortcuts="ArrowRight"
          >
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* The card, with a subtle second sheet peeking below when more myths follow. */}
      <div className="relative isolate pb-2">
        {currentIndex < total - 1 && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-0.5 inset-x-4 -z-10 h-5 rounded-(--radius-surface) border border-sapphire-border/60 bg-card/70 shadow-2xs dark:border-white/10 dark:bg-ink-800/70"
          />
        )}

        <div key={activeMythKey} data-dir={navState.dir} className="myth-card-swap relative z-0">
          {children}
        </div>
      </div>
    </div>
  );
}
