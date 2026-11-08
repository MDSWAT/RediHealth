"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG } from "@/lib/i18n/routing";

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

  const dict = {
    en: {
      standard: "Standard",
      simple: "Plain language",
      aria: "Reading level",
    },
    ro: {
      standard: "Ghid complet",
      simple: "Limbaj simplu",
      aria: "Nivel de citire",
    },
    sq: {
      standard: "Udhëzues i plotë",
      simple: "Gjuhë e thjeshtë",
      aria: "Niveli i leximit",
    },
    it: {
      standard: "Guida completa",
      simple: "Linguaggio semplice",
      aria: "Livello di lettura",
    },
  };
  const labels = dict[lang as keyof typeof dict] || dict[DEFAULT_LANG];

  return (
    <div
      role="group"
      aria-label={labels.aria}
      className={`inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 ${className}`}
    >
      <button
        type="button"
        onClick={() => {
          if (enabled) onToggle();
        }}
        aria-pressed={!enabled}
        className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium transition-colors duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
          !enabled
            ? "bg-card text-foreground font-semibold shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span>{labels.standard}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          if (!enabled) onToggle();
        }}
        aria-pressed={enabled}
        className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium transition-colors duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
          enabled
            ? "bg-card text-foreground font-semibold shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span>{labels.simple}</span>
      </button>
    </div>
  );
}
