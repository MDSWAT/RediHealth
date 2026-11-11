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
      <h2 className="text-2xl font-semibold tracking-[-0.02em] text-foreground text-balance sm:text-[28px]">
        {plainLanguage ? tree.plainHeading : tree.heading}
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
        {tree.lead}
      </p>

      {/* The most common need, set apart: a flat tinted panel with its one primary button. */}
      <div className="mt-6 rounded-2xl bg-sapphire-soft/70 p-5 dark:bg-sapphire/15 sm:p-6">
        <button
          type="button"
          data-triage-option="symptoms"
          onClick={() => onSelectPathway("symptoms")}
          className="group flex w-full flex-col gap-4 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-4 focus-visible:ring-offset-sapphire-soft sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex min-w-0 items-start gap-4">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sapphire text-white"
            >
              <ActivityIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xl font-semibold leading-snug tracking-[-0.015em] text-foreground sm:text-[22px]">
                {plainLanguage ? symptomsOption.plainTitle : symptomsOption.title}
              </span>
              <span className="mt-1 block text-[15px] leading-relaxed text-muted-foreground">
                {symptomsOption.subtitle}
              </span>
            </span>
          </span>

          <span className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-sapphire px-5 text-[15px] font-semibold text-white shadow-2xs transition-[background-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:bg-sapphire-light group-active:scale-[0.98] motion-reduce:transform-none sm:w-auto">
            <span>{actionLabels.startSymptoms}</span>
            <ArrowRightIcon
              className="h-4 w-4 shrink-0 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-safe:group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </button>

        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground sm:pl-15">
          <span>{tree.bodyMapPrompt}</span>
          <Link
            href={withLangPrefix("/health-check", lang)}
            className="group/link -mx-1 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 font-semibold text-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          >
            <span className="underline decoration-sapphire/30 underline-offset-4 transition-colors duration-[var(--dur-fast)] group-hover/link:decoration-sapphire">
              {tree.bodyMapLink}
            </span>
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </p>
      </div>

      {/* The other four needs: compact rows, the whole row is the button. */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SECONDARY_PATHWAY_CARDS.map(({ id, icon: Icon, mediator }) => {
          const option = tree.options[id];
          return (
            <button
              key={id}
              type="button"
              data-triage-option={id}
              onClick={() => onSelectPathway(id)}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-[border-color,background-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire/50 hover:bg-sapphire-soft/30 motion-safe:active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 sm:p-5"
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sapphire-soft text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:bg-sapphire group-hover:text-white"
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] font-semibold leading-snug text-foreground">
                  {plainLanguage ? option.plainTitle : option.title}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{option.subtitle}</span>
                {mediator && (
                  <span className="mt-2 block text-sm font-medium text-sapphire">{tree.mediatorTag}</span>
                )}
              </span>
              <ArrowRightIcon
                aria-hidden="true"
                className="mt-2.5 h-4.5 w-4.5 shrink-0 text-sapphire transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-safe:group-hover:translate-x-0.5"
              />
            </button>
          );
        })}
      </div>

      <TriageInputBar onSubmitQuery={onSubmitIntentQuery} plainLanguage={plainLanguage} />
    </div>
  );
}
