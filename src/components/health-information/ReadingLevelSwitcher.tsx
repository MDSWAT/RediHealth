"use client";

import { useEffect, useRef } from "react";
import { CAPSULE_OUTLINE, CAPSULE_SHAPE } from "@/components/layout/chrome-capsule";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  getReadingLevelSnapshot,
  setReadingLevel,
  subscribeComfort,
} from "@/lib/comfort-preferences";
import type { Lang } from "@/lib/i18n/translations";

export interface ReadingLevelSwitcherProps {
  level: "simple" | "complete";
  onChange: (level: "simple" | "complete") => void;
  className?: string;
  labels?: {
    ariaLabel?: string;
    simple?: string;
    complete?: string;
  };
}

function useSafeLanguage(): Lang {
  try {
    const ctx = useLanguage();
    return ctx?.lang ?? "ro";
  } catch {
    return "ro";
  }
}

export const READING_LEVEL_COPY: Record<
  Lang,
  {
    ariaLabel: string;
    simple: string;
    complete: string;
  }
> = {
  ru: {
    ariaLabel: "Режим чтения",
    simple: "Коротко",
    complete: "Подробно",
  },
  ro: {
    ariaLabel: "Mod de citire",
    simple: "Pe scurt",
    complete: "Detaliat",
  },
  en: {
    ariaLabel: "Reading mode",
    simple: "Easy",
    complete: "Detailed",
  },
  sq: {
    ariaLabel: "Mënyra e leximit",
    simple: "Shkurt",
    complete: "Detajuar",
  },
  it: {
    ariaLabel: "Modalità di lettura",
    simple: "Semplice",
    complete: "Dettagliato",
  },
  hr: {
    ariaLabel: "Način čitanja",
    simple: "Ukratko",
    complete: "Detaljno",
  },
  rom: {
    ariaLabel: "Sar drabares",
    simple: "Skurto",
    complete: "Detaliime",
  },
};

/*
 * The label colour hands over on the same curve and in the same time as the sliding marker,
 * so the white text arrives with the marker instead of flashing ahead of it. The idle side
 * answers the pointer with a faint tint before it is chosen. Both are still under reduced motion.
 */
const SEGMENT_CLASS =
  "press-row relative z-10 inline-flex min-h-12 items-center justify-center whitespace-nowrap px-4 py-2 text-base transition-[color,background-color] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none";
const SEGMENT_IDLE_CLASS =
  "font-medium text-muted-foreground hover:bg-sapphire-soft/50 hover:text-foreground dark:hover:bg-white/5";

export function ReadingLevelSwitcher({
  level,
  onChange,
  className = "",
  labels,
}: ReadingLevelSwitcherProps) {
  const lang = useSafeLanguage();
  const copy = READING_LEVEL_COPY[lang] ?? READING_LEVEL_COPY.ro;
  const ariaLabel = labels?.ariaLabel ?? copy.ariaLabel;
  const simpleText = labels?.simple ?? copy.simple;
  const completeText = labels?.complete ?? copy.complete;

  const simpleBtnRef = useRef<HTMLButtonElement | null>(null);
  const completeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Restore the reader's last choice on mount and keep in sync when changed from Header ComfortMenu.
  const latestRef = useRef({ level, onChange });
  useEffect(() => {
    latestRef.current = { level, onChange };
  }, [level, onChange]);

  useEffect(() => {
    const syncFromStore = () => {
      const stored = getReadingLevelSnapshot();
      if (stored !== latestRef.current.level) {
        latestRef.current.onChange(stored);
      }
    };
    syncFromStore();
    return subscribeComfort(syncFromStore);
  }, []);

  const handleSelect = (newLevel: "simple" | "complete") => {
    onChange(newLevel);
    setReadingLevel(newLevel);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "Home") {
      event.preventDefault();
      handleSelect("simple");
      simpleBtnRef.current?.focus();
    } else if (event.key === "ArrowRight" || event.key === "End") {
      event.preventDefault();
      handleSelect("complete");
      completeBtnRef.current?.focus();
    }
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      data-capsule-switch=""
      className={`relative inline-grid grid-cols-2 items-center p-1 ${CAPSULE_SHAPE} ${CAPSULE_OUTLINE} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] ${CAPSULE_SHAPE} bg-sapphire shadow-xs transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] motion-reduce:transition-none dark:bg-sapphire-light`}
        style={{
          transform: level === "complete" ? "translateX(100%)" : "translateX(0%)",
        }}
      />

      <button
        ref={simpleBtnRef}
        type="button"
        onClick={() => handleSelect("simple")}
        aria-pressed={level === "simple"}
        className={`${SEGMENT_CLASS} ${CAPSULE_SHAPE} ${
          level === "simple"
            ? "font-semibold text-white"
            : SEGMENT_IDLE_CLASS
        }`}
      >
        <span>{simpleText}</span>
      </button>

      <button
        ref={completeBtnRef}
        type="button"
        onClick={() => handleSelect("complete")}
        aria-pressed={level === "complete"}
        className={`${SEGMENT_CLASS} ${CAPSULE_SHAPE} ${
          level === "complete"
            ? "font-semibold text-white"
            : SEGMENT_IDLE_CLASS
        }`}
      >
        <span>{completeText}</span>
      </button>
    </div>
  );
}
