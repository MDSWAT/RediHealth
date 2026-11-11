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

export function TriagePlainLanguageToggle({
  enabled,
  onToggle,
  className = "",
}: TriagePlainLanguageToggleProps) {
  const { lang } = useLanguage();
  const simpleBtnRef = useRef<HTMLButtonElement | null>(null);
  const standardBtnRef = useRef<HTMLButtonElement | null>(null);

  // Same order, labels and look as the topic pages' format switch: concise overview first.
  const dict: Record<Lang, { simple: string; standard: string; aria: string }> = {
    en: {
      simple: "In brief",
      standard: "Complete guide",
      aria: "Guide format",
    },
    ro: {
      simple: "Pe scurt",
      standard: "Ghid complet",
      aria: "Formatul ghidului",
    },
    sq: {
      simple: "Shkurt",
      standard: "Udhëzues i plotë",
      aria: "Formati i udhëzuesit",
    },
    it: {
      simple: "In breve",
      standard: "Guida completa",
      aria: "Formato della guida",
    },
    hr: {
      simple: "Ukratko",
      standard: "Potpuni vodič",
      aria: "Format vodiča",
    },
    rom: {
      simple: "Xarnes",
      standard: "Sasto sikavimos",
      aria: "Sar sikavel pes",
    },
  };
  const labels = dict[lang] || dict[DEFAULT_LANG];

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
      className={`relative grid w-full grid-cols-2 items-center rounded-xl border border-border bg-card p-1 shadow-2xs sm:inline-grid sm:w-auto ${className}`}
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
        className={`relative z-10 inline-flex min-h-11 items-center justify-center rounded-lg px-3 py-2 text-center text-sm leading-tight transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire motion-reduce:transition-none sm:whitespace-nowrap sm:px-3.5 sm:text-sm ${
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
        className={`relative z-10 inline-flex min-h-11 items-center justify-center rounded-lg px-3 py-2 text-center text-sm leading-tight transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire motion-reduce:transition-none sm:whitespace-nowrap sm:px-3.5 sm:text-sm ${
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
