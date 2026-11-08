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

  // Restore the reader's last choice once, on mount. Later changes come from clicks.
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

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 ${className}`}
    >
      <button
        type="button"
        onClick={() => handleSelect("simple")}
        aria-pressed={level === "simple"}
        className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
          level === "simple"
            ? "bg-foreground font-semibold text-background"
            : "text-foreground hover:bg-card"
        }`}
      >
        <span>{simpleText}</span>
      </button>

      <button
        type="button"
        onClick={() => handleSelect("complete")}
        aria-pressed={level === "complete"}
        className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3.5 py-2 text-sm font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
          level === "complete"
            ? "bg-foreground font-semibold text-background"
            : "text-foreground hover:bg-card"
        }`}
      >
        <span>{completeText}</span>
      </button>
    </div>
  );
}
