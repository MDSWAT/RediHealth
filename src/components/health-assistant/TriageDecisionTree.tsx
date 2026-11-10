"use client";

import Link from "next/link";
import {
  ActivityIcon,
  ArrowRightIcon,
  BookIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  HandHelpingIcon,
} from "@/components/ui/icons";
import { PathwayId } from "@/lib/triage-state";
import { TriageInputBar } from "@/components/health-assistant/TriageInputBar";
import { useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";

interface TriageDecisionTreeProps {
  onSelectPathway: (pathway: PathwayId) => void;
  onSubmitIntentQuery: (query: string) => void;
  plainLanguage: boolean;
}

const PAIRED_CLINICAL_CARDS: { id: Exclude<PathwayId, "symptoms" | "navigation">; icon: typeof BookIcon }[] = [
  { id: "prescription", icon: FileTextIcon },
  { id: "risk", icon: ClipboardCheckIcon },
  { id: "learn", icon: BookIcon },
];

export function TriageDecisionTree({
  onSelectPathway,
  onSubmitIntentQuery,
  plainLanguage,
}: TriageDecisionTreeProps) {
  const { tree } = useAssistantCopy();
  const { lang } = useLanguage();

  const symptomsOption = tree.options.symptoms;
  const navigationOption = tree.options.navigation;

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-foreground text-balance sm:text-2xl">
        {plainLanguage ? tree.plainHeading : tree.heading}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tree.lead}</p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Hero Cell: Symptoms check (sm:col-span-2) in sapphire-soft + /health-check 3D body map link */}
        <div className="rounded-xl border border-sapphire/25 bg-sapphire-soft/55 p-4 sm:col-span-2 sm:p-5">
          <button
            type="button"
            data-triage-option="symptoms"
            onClick={() => onSelectPathway("symptoms")}
            className="group flex min-h-[64px] w-full items-start gap-3.5 rounded-lg text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sapphire/20 bg-card text-sapphire"
            >
              <ActivityIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold text-foreground group-hover:text-sapphire sm:text-lg">
                {plainLanguage ? symptomsOption.plainTitle : symptomsOption.title}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                {symptomsOption.subtitle}
              </span>
            </span>
            <ChevronRightIcon
              className="mt-1 h-5 w-5 shrink-0 text-sapphire transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 motion-reduce:transform-none"
              aria-hidden="true"
            />
          </button>

          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5 border-t border-sapphire/15 pt-3">
            <span className="text-xs leading-snug text-muted-foreground sm:text-sm">{tree.bodyMapPrompt}</span>
            <Link
              href={withLangPrefix("/health-check", lang)}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-sapphire/25 bg-card px-3.5 py-2 text-xs font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 sm:text-sm"
            >
              <span>{tree.bodyMapLink}</span>
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Paired Clinical Cards: Prescription, Risk, Learn */}
        {PAIRED_CLINICAL_CARDS.map(({ id, icon: Icon }) => {
          const option = tree.options[id];
          return (
            <button
              key={id}
              type="button"
              data-triage-option={id}
              onClick={() => onSelectPathway(id)}
              className="group flex min-h-[112px] flex-col justify-between rounded-xl border border-border bg-card p-4 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 sm:p-5"
            >
              <span className="flex w-full items-start justify-between gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sapphire-soft text-sapphire"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <ChevronRightIcon
                  className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 group-hover:text-sapphire motion-reduce:transform-none"
                  aria-hidden="true"
                />
              </span>
              <span className="mt-3 block w-full">
                <span className="block text-base font-semibold leading-snug text-foreground">
                  {plainLanguage ? option.plainTitle : option.title}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                  {option.subtitle}
                </span>
              </span>
            </button>
          );
        })}

        {/* Community Mediator Navigation Cell in amber-care */}
        <button
          type="button"
          data-triage-option="navigation"
          onClick={() => onSelectPathway("navigation")}
          className="group flex min-h-[112px] flex-col justify-between rounded-xl border border-amber-care-border bg-amber-care-soft/55 p-4 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-amber-care-soft/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 dark:border-amber-care/40 dark:bg-amber-care/10 dark:hover:bg-amber-care/20 sm:p-5"
        >
          <span className="flex w-full flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-care-border bg-amber-care-soft px-2 py-0.5 text-xs font-semibold text-foreground dark:border-amber-care/40 dark:bg-amber-care/20">
              <HandHelpingIcon className="h-3.5 w-3.5 shrink-0 text-amber-care dark:text-amber-care-border" aria-hidden="true" />
              <span>{tree.mediatorTag}</span>
            </span>
            <ChevronRightIcon
              className="h-4 w-4 shrink-0 text-foreground/70 transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5 motion-reduce:transform-none"
              aria-hidden="true"
            />
          </span>
          <span className="mt-3 block w-full">
            <span className="block text-base font-semibold leading-snug text-foreground">
              {plainLanguage ? navigationOption.plainTitle : navigationOption.title}
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
              {navigationOption.subtitle}
            </span>
          </span>
        </button>
      </div>

      <TriageInputBar onSubmitQuery={onSubmitIntentQuery} plainLanguage={plainLanguage} />
    </div>
  );
}
