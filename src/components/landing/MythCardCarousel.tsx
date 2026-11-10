"use client";

import { useRef, useState } from "react";
import type { HealthMyth } from "@/lib/i18n/health-myths";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
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
  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-(--shadow-card-rest) transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground/60 disabled:shadow-none motion-reduce:transition-none";

export function MythCardCarousel({
  myths,
  currentIndex,
  onIndexChange,
  children,
  results = {},
  aside,
  className = "",
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
    <div className={`space-y-3 ${className}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-sm font-medium tabular-nums text-muted-foreground" aria-live="polite">
            {t.quiz.mythProgressPrefix} {currentIndex + 1} {t.quiz.mythProgressOf} {total}
          </span>
          {aside}
        </div>

        <div className="flex items-center gap-1.5">
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

      {/* Scrub segments: full 44px vertical touch envelope around each 6px visual bar. */}
      <div className="-my-2 flex gap-1.5">
        {myths.map((m, idx) => {
          const result = results[m.id];
          const isCurrent = idx === currentIndex;
          const fill =
            result === "correct"
              ? "bg-sapphire"
              : result === "wrong"
                ? "bg-amber-care"
                : isCurrent
                  ? "bg-foreground/75"
                  : "bg-border group-hover/seg:bg-foreground/35";
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onIndexChange(idx)}
              aria-label={`${t.quiz.mythProgressPrefix} ${idx + 1}`}
              aria-current={isCurrent ? "step" : undefined}
              className="group/seg flex min-h-[44px] flex-1 items-center py-2 focus-visible:outline-none"
            >
              <span
                className={`block h-1.5 w-full rounded-sm transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none group-focus-visible/seg:ring-2 group-focus-visible/seg:ring-sapphire ${fill} ${
                  isCurrent && result ? "ring-1 ring-foreground/45 ring-offset-1 ring-offset-background" : ""
                }`}
              />
            </button>
          );
        })}
      </div>

      <div key={activeMythKey} data-dir={navState.dir} className="myth-card-swap">
        {children}
      </div>
    </div>
  );
}
