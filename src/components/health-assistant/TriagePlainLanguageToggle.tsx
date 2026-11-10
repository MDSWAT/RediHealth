"use client";

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

  // Same order, labels and look as the topic pages' reading-level switch: plain language first.
  const dict: Record<Lang, { simple: string; standard: string; aria: string }> = {
    en: {
      simple: "Plain language",
      standard: "Complete guide",
      aria: "Reading level",
    },
    ro: {
      simple: "Limbaj simplu",
      standard: "Ghid complet",
      aria: "Nivel de lectură",
    },
    sq: {
      simple: "Gjuhë e thjeshtë",
      standard: "Udhëzues i plotë",
      aria: "Niveli i leximit",
    },
    it: {
      simple: "Linguaggio semplice",
      standard: "Guida completa",
      aria: "Livello di lettura",
    },
    hr: {
      simple: "Jednostavan jezik",
      standard: "Potpuni vodič",
      aria: "Razina čitanja",
    },
    rom: {
      simple: "Lokhi chib",
      standard: "Sasto sikavimos",
      aria: "Nivelo ginavimasko",
    },
  };
  const labels = dict[lang] || dict[DEFAULT_LANG];

  const options = [
    { key: "simple", label: labels.simple, active: enabled },
    { key: "standard", label: labels.standard, active: !enabled },
  ];

  return (
    <div
      role="group"
      aria-label={labels.aria}
      className={`flex w-full items-stretch gap-1 rounded-lg border border-border bg-muted/40 p-1 sm:inline-flex sm:w-auto ${className}`}
    >
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => {
            if (!option.active) onToggle();
          }}
          aria-pressed={option.active}
          className={`inline-flex min-h-[44px] flex-auto items-center justify-center rounded-md px-2.5 py-2 text-center text-[13px] font-medium leading-tight sm:text-sm sm:flex-none sm:whitespace-nowrap sm:px-3.5 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
            option.active
              ? "bg-foreground font-semibold text-background"
              : "text-foreground hover:bg-card"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
