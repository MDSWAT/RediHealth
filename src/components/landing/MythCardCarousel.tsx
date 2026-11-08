"use client";

import { useRef } from "react";
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
  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire disabled:cursor-not-allowed disabled:opacity-40";

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

  return (
    <div className={`space-y-3 ${className}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
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
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => currentIndex < total - 1 && onIndexChange(currentIndex + 1)}
            disabled={currentIndex === total - 1}
            className={navButton}
            aria-label={t.quiz.nextMythAria}
          >
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Segments: colour shows each answer's outcome; each one jumps to its myth. */}
      <div className="flex gap-1.5">
        {myths.map((m, idx) => {
          const result = results[m.id];
          const isCurrent = idx === currentIndex;
          const fill =
            result === "correct"
              ? "bg-sapphire"
              : result === "wrong"
                ? "bg-amber-care"
                : isCurrent
                  ? "bg-foreground/70"
                  : "bg-border group-hover/seg:bg-foreground/30";
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onIndexChange(idx)}
              aria-label={`${t.quiz.mythProgressPrefix} ${idx + 1}`}
              aria-current={isCurrent ? "step" : undefined}
              className="group/seg flex h-5 flex-1 items-center focus-visible:outline-none"
            >
              <span
                className={`block h-1.5 w-full rounded-sm transition-colors duration-150 group-focus-visible/seg:ring-2 group-focus-visible/seg:ring-sapphire ${fill} ${
                  isCurrent && result ? "ring-1 ring-foreground/40 ring-offset-1 ring-offset-background" : ""
                }`}
              />
            </button>
          );
        })}
      </div>

      <div>{children}</div>
    </div>
  );
}
