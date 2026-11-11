"use client";

import Link from "next/link";
import {
  ActivityIcon,
  ArrowRightIcon,
  BookIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  HandHelpingIcon,
} from "@/components/ui/icons";
import { PathwayId } from "@/lib/triage-state";
import { TriageInputBar } from "@/components/health-assistant/TriageInputBar";
import { useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG, withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import {
  optionArrow,
  optionDesc,
  optionIcon,
  optionRow,
  optionTitle,
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
  icon: typeof BookIcon;
  /** A health mediator (a person) helps on this path; said in one line under the option. */
  mediator?: boolean;
}[] = [
  { id: "prescription", icon: FileTextIcon },
  { id: "risk", icon: ClipboardCheckIcon },
  { id: "learn", icon: BookIcon },
  { id: "navigation", icon: HandHelpingIcon, mediator: true },
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

      {/* The most common need, set apart: elevated hero card with clean hierarchy */}
      <div className="mt-6 rounded-2xl border border-sapphire/25 bg-gradient-to-br from-sapphire-soft/80 via-sapphire-soft/50 to-card p-5 sm:p-7 shadow-xs dark:border-sapphire/30 dark:from-sapphire/20 dark:via-sapphire/10 dark:to-card/90">
        <button
          type="button"
          data-triage-option="symptoms"
          onClick={() => onSelectPathway("symptoms")}
          className="group flex w-full flex-col gap-4 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-4 focus-visible:ring-offset-sapphire-soft sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex min-w-0 items-start gap-4">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sapphire text-white shadow-xs ring-4 ring-sapphire/15 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:scale-105"
            >
              <ActivityIcon className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xl font-semibold leading-snug tracking-[-0.015em] text-foreground sm:text-[22px]">
                {plainLanguage ? symptomsOption.plainTitle : symptomsOption.title}
              </span>
              <span className="mt-1 block text-base leading-relaxed text-muted-foreground">
                {symptomsOption.subtitle}
              </span>
            </span>
          </span>

          <span className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-sapphire px-6 text-base font-semibold text-white shadow-xs transition-all duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:bg-sapphire-light group-hover:shadow-md group-active:scale-[0.98] motion-reduce:transform-none sm:w-auto">
            <span>{actionLabels.startSymptoms}</span>
            <ArrowRightIcon
              className="h-4.5 w-4.5 shrink-0 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-safe:group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </button>

        <div className="mt-4 border-t border-sapphire/15 pt-3.5 sm:mt-5 sm:pt-4">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground sm:pl-16">
            <span>{tree.bodyMapPrompt}</span>
            <Link
              href={withLangPrefix("/health-check", lang)}
              className="group/link inline-flex min-h-9 items-center gap-1.5 rounded-lg font-semibold text-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire dark:text-sapphire-light"
            >
              <span className="underline decoration-sapphire/30 underline-offset-4 transition-colors duration-[var(--dur-fast)] group-hover/link:decoration-sapphire">
                {tree.bodyMapLink}
              </span>
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-[var(--dur-fast)] group-hover/link:translate-x-0.5" aria-hidden="true" />
            </Link>
          </p>
        </div>
      </div>

      {/* The other four needs: high-craft tactile cards with refined typography and micro-interactions */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECONDARY_PATHWAY_CARDS.map(({ id, icon: Icon, mediator }) => {
          const option = tree.options[id];
          return (
            <button
              key={id}
              type="button"
              data-triage-option={id}
              onClick={() => onSelectPathway(id)}
              className="group relative flex w-full flex-col justify-between rounded-2xl border border-stone-200/90 bg-gradient-to-b from-card via-card to-card/95 p-5 sm:p-6 text-left shadow-xs transition-all duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:-translate-y-1 hover:border-sapphire/50 hover:shadow-lg hover:shadow-sapphire/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 motion-safe:active:scale-[0.99] dark:border-stone-800 dark:hover:border-sapphire/50 dark:hover:shadow-sapphire/10"
            >
              <div className="w-full">
                <div className="flex items-center justify-between gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sapphire-soft/90 text-sapphire ring-1 ring-sapphire/15 transition-all duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:scale-105 group-hover:bg-sapphire group-hover:text-white dark:bg-sapphire/20 dark:text-sapphire-light dark:ring-sapphire/30"
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/70 text-muted-foreground transition-all duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:bg-sapphire group-hover:text-white group-hover:translate-x-0.5"
                  >
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </div>

                <div className="mt-4">
                  <span className="block text-base font-semibold leading-snug tracking-[-0.01em] text-foreground transition-colors duration-[var(--dur-fast)] group-hover:text-sapphire dark:group-hover:text-sapphire-light sm:text-[17px]">
                    {plainLanguage ? option.plainTitle : option.title}
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                    {option.subtitle}
                  </span>
                </div>
              </div>

              {mediator && (
                <div className="mt-4 w-full border-t border-border/50 pt-3">
                  <p className="text-sm font-medium text-sapphire dark:text-sapphire-light">{tree.mediatorTag}</p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <TriageInputBar onSubmitQuery={onSubmitIntentQuery} plainLanguage={plainLanguage} />
    </div>
  );
}
