"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PathwayId } from "@/lib/triage-state";
import { TriageInputBar } from "@/components/health-assistant/TriageInputBar";
import { useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG, withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import {
  stepHeading,
  stepLead,
} from "@/components/health-assistant/step-ui";

interface TriageDecisionTreeProps {
  onSelectPathway: (pathway: PathwayId) => void;
  onSubmitIntentQuery: (query: string) => void;
  plainLanguage: boolean;
}

const ACTION_LABELS: Record<
  Lang,
  {
    startSymptoms: string;
  }
> = {
"ru": {"startSymptoms":"Проверить симптомы"},

  ro: {
    startSymptoms: "Începe verificarea",
  },
  en: {
    startSymptoms: "Start symptom check",
  },
  sq: {
    startSymptoms: "Fillo kontrollin",
  },
  it: {
    startSymptoms: "Inizia controllo",
  },
  hr: {
    startSymptoms: "Pokreni provjeru",
  },
  rom: {
    startSymptoms: "Nachav o dikhiben",
  },
};

const SECONDARY_PATHWAY_CARDS: {
  id: Exclude<PathwayId, "symptoms">;
  /** A health mediator (a person) helps on this path; said in one line under the option. */
  mediator?: boolean;
}[] = [
  { id: "prescription" },
  { id: "risk" },
  { id: "learn" },
  { id: "navigation", mediator: true },
];

export function TriageDecisionTree({
  onSelectPathway,
  onSubmitIntentQuery,
  plainLanguage,
}: TriageDecisionTreeProps) {
  const { tree } = useAssistantCopy();
  const { lang } = useLanguage();
  const actionLabels = ACTION_LABELS[lang] || ACTION_LABELS[DEFAULT_LANG];

  const symptomsOption = tree.options.symptoms;

  return (
    <div>
      <h2 className={stepHeading}>
        {plainLanguage ? tree.plainHeading : tree.heading}
      </h2>
      <p className={stepLead}>{tree.lead}</p>

      {/* Primary entry: symptoms check — crisp sapphire-tinted instrument surface */}
      <div className="mt-5 overflow-hidden rounded-xl border border-sapphire/25 bg-sapphire-soft/40 dark:border-sapphire/35 dark:bg-sapphire/15">
        <button
          type="button"
          data-triage-option="symptoms"
          onClick={() => onSelectPathway("symptoms")}
          className="group flex w-full flex-col gap-4 p-4 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-semibold leading-snug tracking-[-0.015em] text-foreground sm:text-xl">
              {plainLanguage ? symptomsOption.plainTitle : symptomsOption.title}
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              {symptomsOption.subtitle}
            </span>
          </span>

          <span className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-sapphire px-5 text-sm font-semibold text-white shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:bg-sapphire-light motion-reduce:transition-none sm:w-auto sm:text-[15px]">
            <span>{actionLabels.startSymptoms}</span>
            <ArrowRightIcon
              className="h-4 w-4 shrink-0 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-safe:group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </button>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-t border-sapphire/15 bg-card/70 px-4 py-2.5 text-sm sm:px-5 dark:bg-card/30">
          <span className="text-muted-foreground">{tree.bodyMapPrompt}</span>
          <Link
            href={withLangPrefix("/health-check", lang)}
            className="group/link inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg font-semibold text-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-light"
          >
            <span className="underline decoration-sapphire/30 underline-offset-4 transition-colors duration-[var(--dur-fast)] group-hover/link:decoration-sapphire">
              {tree.bodyMapLink}
            </span>
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-[var(--dur-fast)] motion-safe:group-hover/link:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* The other four needs: calm tactile cards matching DESIGN.md */}
      <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SECONDARY_PATHWAY_CARDS.map(({ id, mediator }) => {
          const option = tree.options[id];
          return (
            <button
              key={id}
              type="button"
              data-triage-option={id}
              onClick={() => onSelectPathway(id)}
              className="group relative flex w-full flex-col justify-between rounded-xl border border-stone-200/90 bg-card p-4 text-left shadow-2xs transition-[border-color,background-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire/45 hover:bg-sapphire-soft/20 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-5 dark:border-stone-800 dark:hover:border-sapphire/50"
            >
              <div className="flex w-full items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="block text-base font-semibold leading-snug tracking-[-0.01em] text-foreground transition-colors duration-[var(--dur-fast)] group-hover:text-sapphire dark:group-hover:text-sapphire-light sm:text-[17px]">
                    {plainLanguage ? option.plainTitle : option.title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    {option.subtitle}
                  </span>
                </div>

                <ArrowRightIcon
                  className="mt-1 h-4 w-4 shrink-0 text-stone-400 transition-[color,transform] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:text-sapphire motion-safe:group-hover:translate-x-0.5 dark:group-hover:text-sapphire-light"
                  aria-hidden="true"
                />
              </div>

              {mediator && (
                <p className="mt-3 w-full text-xs font-semibold text-amber-care">
                  {tree.mediatorTag}
                </p>
              )}
            </button>
          );
        })}
      </div>

      <TriageInputBar onSubmitQuery={onSubmitIntentQuery} plainLanguage={plainLanguage} />
    </div>
  );
}
