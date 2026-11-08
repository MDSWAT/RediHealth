"use client";

import { useState } from "react";
import { ArrowRightIcon, SearchIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG } from "@/lib/i18n/routing";

interface TriageInputBarProps {
  onSubmitQuery: (query: string) => void;
  className?: string;
}

export function TriageInputBar({ onSubmitQuery, className = "" }: TriageInputBarProps) {
  const { lang } = useLanguage();
  const [query, setQuery] = useState("");

  const dict = {
    en: {
      label: "Or tell us in a few words what is worrying you",
      placeholder: "For example: I've had a fever for 2 days, I have no health insurance…",
      buttonLabel: "Start",
    },
    ro: {
      label: "Sau scrie pe scurt ce te îngrijorează",
      placeholder: "De exemplu: am febră de 2 zile, nu am asigurare de sănătate…",
      buttonLabel: "Începe",
    },
    sq: {
      label: "Ose shkruaj shkurt çfarë të shqetëson",
      placeholder: "Për shembull: kam temperaturë prej 2 ditësh, nuk kam sigurim shëndetësor…",
      buttonLabel: "Fillo",
    },
    it: {
      label: "Oppure scrivi in breve cosa ti preoccupa",
      placeholder: "Ad esempio: ho la febbre da 2 giorni, non ho l'assicurazione sanitaria…",
      buttonLabel: "Inizia",
    },
  };
  const t = dict[lang as keyof typeof dict] || dict[DEFAULT_LANG];

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onSubmitQuery(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className={`mt-6 ${className}`}>
      <label htmlFor="triage-natural-query" className="mb-2 block text-sm font-medium text-foreground">
        {t.label}
      </label>
      <div className="flex flex-col gap-2 sm:relative sm:block">
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-3.5 text-muted-foreground">
            <SearchIcon className="h-5 w-5" />
          </span>
          <input
            id="triage-natural-query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.placeholder}
            className="min-h-[52px] w-full rounded-lg border border-border bg-background py-3 pl-11 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:pr-40"
          />
        </div>
        <button
          type="submit"
          disabled={!query.trim()}
          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-primary/90 disabled:opacity-50 sm:absolute sm:right-1.5 sm:top-1/2 sm:-translate-y-1/2 sm:text-xs"
        >
          <span>{t.buttonLabel}</span>
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </form>
  );
}
