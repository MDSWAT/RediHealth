"use client";

import { useEffect, useRef } from "react";
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
      className={`relative inline-grid grid-cols-2 items-center rounded-xl border border-border-control bg-card p-1 shadow-2xs ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-sapphire shadow-xs transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none dark:bg-sapphire-light"
        style={{
          transform: level === "complete" ? "translateX(100%)" : "translateX(0%)",
        }}
      />

      <button
        ref={simpleBtnRef}
        type="button"
        onClick={() => handleSelect("simple")}
        aria-pressed={level === "simple"}
        className={`press-row relative z-10 inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-base transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${
          level === "simple"
            ? "font-semibold text-white"
            : "font-medium text-muted-foreground hover:text-foreground"
        }`}
      >
        <span>{simpleText}</span>
      </button>

      <button
        ref={completeBtnRef}
        type="button"
        onClick={() => handleSelect("complete")}
        aria-pressed={level === "complete"}
        className={`press-row relative z-10 inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-base transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${
          level === "complete"
            ? "font-semibold text-white"
            : "font-medium text-muted-foreground hover:text-foreground"
        }`}
      >
        <span>{completeText}</span>
      </button>
    </div>
  );
}
