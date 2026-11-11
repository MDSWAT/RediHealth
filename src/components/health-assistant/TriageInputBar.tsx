"use client";

import { useRef, useState } from "react";
import { ArrowRightIcon, SearchIcon } from "@/components/ui/icons";
import { useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import { classifyLocalIntent } from "@/components/health-assistant/intent-keywords";
import { classifyIntentToPathway, type PathwayId } from "@/lib/triage-state";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

interface TriageInputBarProps {
  onSubmitQuery: (query: string) => void;
  plainLanguage?: boolean;
  className?: string;
}

const INPUT_COPY: Record<
  Lang,
  {
    label: string;
    placeholder: string;
    buttonLabel: string;
    routePrefix: string;
    openRoute: string;
    startersLabel: string;
    starters: [string, string, string];
  }
> = {
  en: {
    label: "Or tell us in a few words what is worrying you",
    placeholder: "For example: I've had a fever for 2 days, I have no health insurance…",
    buttonLabel: "Start",
    routePrefix: "Suggested guide:",
    openRoute: "Continue",
    startersLabel: "Quick examples",
    starters: [
      "Fever for 2 days",
      "How to take my prescription",
      "Doctor visit without insurance",
    ],
  },
  ro: {
    label: "Sau scrie pe scurt ce te îngrijorează",
    placeholder: "De exemplu: am febră de 2 zile, nu am asigurare de sănătate…",
    buttonLabel: "Începe",
    routePrefix: "Ghid sugerat:",
    openRoute: "Continuă",
    startersLabel: "Exemple rapide",
    starters: [
      "Am febră de 2 zile",
      "Cum iau medicamentele din rețetă",
      "La medic fără asigurare CNAS",
    ],
  },
  sq: {
    label: "Ose shkruaj shkurt çfarë të shqetëson",
    placeholder: "Për shembull: kam temperaturë prej 2 ditësh, nuk kam sigurim shëndetësor…",
    buttonLabel: "Fillo",
    routePrefix: "Udhëzuesi i sugjeruar:",
    openRoute: "Vazhdo",
    startersLabel: "Shembuj të shpejtë",
    starters: [
      "Kam temperaturë prej 2 ditësh",
      "Si t'i marr ilaçet e recetës",
      "Vizitë te mjeku pa sigurim",
    ],
  },
  it: {
    label: "Oppure scrivi in breve cosa ti preoccupa",
    placeholder: "Ad esempio: ho la febbre da 2 giorni, non ho l'assicurazione sanitaria…",
    buttonLabel: "Inizia",
    routePrefix: "Guida consigliata:",
    openRoute: "Continua",
    startersLabel: "Esempi rapidi",
    starters: [
      "Ho la febbre da 2 giorni",
      "Come prendere i farmaci della ricetta",
      "Visita medica senza assicurazione",
    ],
  },
  hr: {
    label: "Ili ukratko napiši što te brine",
    placeholder: "Na primjer: imam vrućicu 2 dana, nemam zdravstveno osiguranje…",
    buttonLabel: "Kreni",
    routePrefix: "Predloženi vodič:",
    openRoute: "Nastavi",
    startersLabel: "Brzi primjeri",
    starters: [
      "Imam vrućicu 2 dana",
      "Kako uzimati lijekove s recepta",
      "Pregled bez zdravstvenog osiguranja",
    ],
  },
  rom: {
    label: "Vaj ramov skurto so daravel tut",
    placeholder: "Misal: si man tatipen de 2 divesa, na-i man sastipnasko asigurimos…",
    buttonLabel: "Nachav",
    routePrefix: "Sikavimos alosardo:",
    openRoute: "Dja maj dur",
    startersLabel: "Sige misala",
    starters: [
      "Si man tatipen de 2 divesa",
      "Sar te lav i drab katar i receta",
      "Ko doktori bi asigurimasko",
    ],
  },
};

export function TriageInputBar({ onSubmitQuery, plainLanguage = true, className = "" }: TriageInputBarProps) {
  const { lang } = useLanguage();
  const { tree } = useAssistantCopy();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const t = INPUT_COPY[lang] || INPUT_COPY[DEFAULT_LANG];
  const trimmed = query.trim();

  const previewPathway: PathwayId | null =
    trimmed.length >= 3
      ? classifyLocalIntent(trimmed, lang) ?? classifyIntentToPathway(trimmed)
      : null;

  const previewTitle = previewPathway
    ? plainLanguage
      ? tree.options[previewPathway].plainTitle
      : tree.options[previewPathway].title
    : null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!trimmed) return;
    onSubmitQuery(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className={`mt-8 border-t border-border pt-7 ${className}`}>
      <label htmlFor="triage-natural-query" className="mb-2.5 block text-sm font-semibold text-foreground">
        {t.label}
      </label>
      <div className="flex flex-col gap-2.5 sm:relative sm:block">
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-4 text-muted-foreground" aria-hidden="true">
            <SearchIcon className="h-5 w-5" />
          </span>
          <input
            ref={inputRef}
            id="triage-natural-query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.placeholder}
            className="min-h-14 w-full rounded-xl border border-border-control bg-card py-3 pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire/60 focus-visible:border-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire sm:pr-32"
          />
        </div>
        <button
          type="submit"
          disabled={!trimmed}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-sapphire px-4 text-sm font-semibold text-white shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none sm:absolute sm:right-1.5 sm:top-1/2 sm:-translate-y-1/2 sm:text-xs"
        >
          <span>{t.buttonLabel}</span>
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <div aria-live="polite" aria-atomic="true">
        {previewPathway && previewTitle && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-sapphire/25 bg-sapphire-soft/60 px-4 py-3">
            <p className="min-w-0 text-xs leading-snug text-foreground sm:text-sm">
              <span className="text-muted-foreground">{t.routePrefix}</span>{" "}
              <span className="font-semibold text-sapphire">{previewTitle}</span>
            </p>
            <button
              type="button"
              onClick={() => onSubmitQuery(trimmed)}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-sapphire px-3.5 py-2 text-xs font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2"
            >
              <span>{t.openRoute}</span>
              <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div role="group" aria-label={t.startersLabel} className="mt-3 flex flex-wrap gap-2">
        {t.starters.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => {
              setQuery(prompt);
              inputRef.current?.focus();
            }}
            className="inline-flex min-h-11 items-center rounded-full border border-border-control bg-card px-4 py-2 text-left text-sm font-medium text-foreground transition-[color,background-color,border-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire hover:bg-sapphire-soft/50 motion-safe:active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2"
          >
            {prompt}
          </button>
        ))}
      </div>
    </form>
  );
}
