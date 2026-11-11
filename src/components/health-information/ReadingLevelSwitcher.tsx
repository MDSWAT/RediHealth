"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
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

const copyByLang: Record<
  Lang,
  {
    ariaLabel: string;
    simple: string;
    complete: string;
  }
> = {
  ro: {
    ariaLabel: "Nivel de lectură",
    simple: "Limbaj simplu",
    complete: "Ghid complet",
  },
  en: {
    ariaLabel: "Reading level",
    simple: "Plain language",
    complete: "Complete guide",
  },
  sq: {
    ariaLabel: "Niveli i leximit",
    simple: "Gjuhë e thjeshtë",
    complete: "Udhëzues i plotë",
  },
  it: {
    ariaLabel: "Livello di lettura",
    simple: "Linguaggio semplice",
    complete: "Guida completa",
  },
  hr: {
    ariaLabel: "Razina čitanja",
    simple: "Jednostavan jezik",
    complete: "Potpuni vodič",
  },
  rom: {
    ariaLabel: "Sar te drabares",
    simple: "Lokhi chib",
    complete: "Sa o sikavimos",
  },
};

export function ReadingLevelSwitcher({
  level,
  onChange,
  className = "",
  labels,
}: ReadingLevelSwitcherProps) {
  const lang = useSafeLanguage();
  const copy = copyByLang[lang] ?? copyByLang.ro;
  const ariaLabel = labels?.ariaLabel ?? copy.ariaLabel;
  const simpleText = labels?.simple ?? copy.simple;
  const completeText = labels?.complete ?? copy.complete;

  const simpleBtnRef = useRef<HTMLButtonElement | null>(null);
  const completeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Restore the reader's last choice once, on mount. Later changes come from clicks or arrow keys.
  const initialRef = useRef({ level, onChange });
  useEffect(() => {
    const { level: initialLevel, onChange: restore } = initialRef.current;
    try {
      const stored = localStorage.getItem("redihealth_reading_level");
      if ((stored === "simple" || stored === "complete") && stored !== initialLevel) {
        restore(stored);
      }
    } catch {
      // LocalStorage access restricted in private mode
    }
  }, []);

  const handleSelect = (newLevel: "simple" | "complete") => {
    onChange(newLevel);
    try {
      localStorage.setItem("redihealth_reading_level", newLevel);
    } catch {
      // LocalStorage access restricted
    }
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
      className={`relative inline-grid grid-cols-2 items-center rounded-xl border border-border bg-card p-1 shadow-2xs ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-sapphire shadow-xs transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none"
        style={{
          transform: level === "complete" ? "translateX(100%)" : "translateX(0%)",
        }}
      />

      <button
        ref={simpleBtnRef}
        type="button"
        onClick={() => handleSelect("simple")}
        aria-pressed={level === "simple"}
        className={`relative z-10 inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-2 text-sm transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire motion-reduce:transition-none ${
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
        className={`relative z-10 inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-2 text-sm transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire motion-reduce:transition-none ${
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
