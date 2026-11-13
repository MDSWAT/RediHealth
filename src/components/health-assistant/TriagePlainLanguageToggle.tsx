"use client";

import { useRef } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

interface TriagePlainLanguageToggleProps {
  enabled: boolean;
  onToggle: () => void;
  className?: string;
}

export const TRIAGE_READING_LEVEL_COPY: Record<Lang, { simple: string; standard: string; aria: string }> = {
  ru: {
    simple: "Коротко",
    standard: "Подробно",
    aria: "Режим чтения",
  },
  en: {
    simple: "Easy",
    standard: "Detailed",
    aria: "Reading mode",
  },
  ro: {
    simple: "Pe scurt",
    standard: "Detaliat",
    aria: "Mod de citire",
  },
  sq: {
    simple: "Shkurt",
    standard: "Detajuar",
    aria: "Mënyra e leximit",
  },
  it: {
    simple: "Semplice",
    standard: "Dettagliato",
    aria: "Modalità di lettura",
  },
  hr: {
    simple: "Ukratko",
    standard: "Detaljno",
    aria: "Način čitanja",
  },
  rom: {
    simple: "Skurto",
    standard: "Detaliime",
    aria: "Sar drabares",
  },
};

export function TriagePlainLanguageToggle({
  enabled,
  onToggle,
  className = "",
}: TriagePlainLanguageToggleProps) {
  const { lang } = useLanguage();
  const simpleBtnRef = useRef<HTMLButtonElement | null>(null);
  const standardBtnRef = useRef<HTMLButtonElement | null>(null);

  const labels = TRIAGE_READING_LEVEL_COPY[lang] || TRIAGE_READING_LEVEL_COPY[DEFAULT_LANG];

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "Home") {
      event.preventDefault();
      if (!enabled) onToggle();
      simpleBtnRef.current?.focus();
    } else if (event.key === "ArrowRight" || event.key === "End") {
      event.preventDefault();
      if (enabled) onToggle();
      standardBtnRef.current?.focus();
    }
  };

  return (
    <div
      role="group"
      aria-label={labels.aria}
      onKeyDown={handleKeyDown}
      className={`relative inline-grid w-auto shrink-0 grid-cols-2 items-center rounded-xl border border-stone-200/90 bg-card p-1 shadow-2xs dark:border-stone-800 ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-sapphire shadow-xs transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none"
        style={{
          transform: enabled ? "translateX(0%)" : "translateX(100%)",
        }}
      />

      <button
        ref={simpleBtnRef}
        type="button"
        onClick={() => {
          if (!enabled) onToggle();
        }}
        aria-pressed={enabled}
        className={`relative z-10 inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg px-2.5 py-1.5 text-center text-[13px] leading-tight transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:px-3.5 sm:text-sm ${
          enabled
            ? "font-semibold text-white"
            : "font-medium text-muted-foreground hover:text-foreground"
        }`}
      >
        {labels.simple}
      </button>

      <button
        ref={standardBtnRef}
        type="button"
        onClick={() => {
          if (enabled) onToggle();
        }}
        aria-pressed={!enabled}
        className={`relative z-10 inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg px-2.5 py-1.5 text-center text-[13px] leading-tight transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:px-3.5 sm:text-sm ${
          !enabled
            ? "font-semibold text-white"
            : "font-medium text-muted-foreground hover:text-foreground"
        }`}
      >
        {labels.standard}
      </button>
    </div>
  );
}
