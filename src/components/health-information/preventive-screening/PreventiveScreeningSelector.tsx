"use client";

import { useCallback, useId, useMemo, useState, useSyncExternalStore } from "react";
import { LazyMotion, domAnimation } from "motion/react";
import type { Lang } from "@/lib/i18n/translations";
import { cn } from "@/lib/cn";
import {
  SCREENING_RECOMMENDATIONS,
  type AgeBracketId,
  type SexFilterId,
} from "./screening-copy";
import { PreventiveScreeningScene } from "./PreventiveScreeningScene";
import { ChevronDownIcon, PrinterIcon } from "@/components/ui/icons";

interface PreventiveScreeningSelectorProps {
  lang: Lang;
  className?: string;
}

/** Interface words that are not in the screening copy. */
const UI: Record<Lang, { inPlan: string; details: string; remove: string; step: string; tabsLabel: string; quote: [string, string] }> = {
  ro: {
    quote: ["„", "”"],
    inPlan: "În lista mea",
    details: "De ce contează și ce îl întrebi pe medic",
    remove: "Scoate din listă",
    step: "Pasul {n} din {total}",
    tabsLabel: "Controale preventive",
  },
  en: {
    quote: ["“", "”"],
    inPlan: "On my list",
    details: "Why it matters and what to ask your doctor",
    remove: "Remove from list",
    step: "Step {n} of {total}",
    tabsLabel: "Preventive checks",
  },
  sq: {
    quote: ["“", "”"],
    inPlan: "Në listën time",
    details: "Pse ka rëndësi dhe çfarë të pyesësh mjekun",
    remove: "Hiqe nga lista",
    step: "Hapi {n} nga {total}",
    tabsLabel: "Kontrollet parandaluese",
  },
  it: {
    quote: ["«", "»"],
    inPlan: "Nella mia lista",
    details: "Perché conta e cosa chiedere al medico",
    remove: "Togli dalla lista",
    step: "Passo {n} di {total}",
    tabsLabel: "Controlli preventivi",
  },
};

/* The plan is remembered on this device. Read through an external store so the first
   client render matches the server (empty plan) and saved items appear right after. */
const STORAGE_KEY = "redihealth_screening_checklist";
const planListeners = new Set<() => void>();
let planCache: { raw: string | null; ids: string[] } = { raw: null, ids: [] };

function readPlan(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== planCache.raw) {
    let ids: string[] = [];
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      ids = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
    } catch {
      ids = [];
    }
    planCache = { raw, ids };
  }
  return planCache.ids;
}

const EMPTY_PLAN: string[] = [];

function subscribePlan(listener: () => void) {
  planListeners.add(listener);
  return () => planListeners.delete(listener);
}

function writePlan(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage blocked: the plan simply is not remembered.
  }
  planListeners.forEach((l) => l());
}

const AGE_BRACKETS: AgeBracketId[] = ["18-39", "40-49", "50-69", "70+"];
const SEX_FILTERS: SexFilterId[] = ["all", "female", "male"];
type Tab = "recommendations" | "timeline" | "checklist";

export function PreventiveScreeningSelector({ lang, className = "" }: PreventiveScreeningSelectorProps) {
  const copy = SCREENING_RECOMMENDATIONS[lang] || SCREENING_RECOMMENDATIONS.ro;
  const ui = UI[lang] ?? UI.ro;
  const id = useId();

  const [ageBracket, setAgeBracket] = useState<AgeBracketId>("40-49");
  const [sexFilter, setSexFilter] = useState<SexFilterId>("all");
  const [activeTab, setActiveTab] = useState<Tab>("recommendations");
  const [timelineStep, setTimelineStep] = useState(0);
  const checkedIds = useSyncExternalStore(subscribePlan, readPlan, () => EMPTY_PLAN);

  const toggleCheck = useCallback((itemId: string) => {
    const current = readPlan();
    writePlan(current.includes(itemId) ? current.filter((x) => x !== itemId) : [...current, itemId]);
  }, []);

  const filteredInvestigations = useMemo(
    () =>
      copy.investigations.filter(
        (inv) =>
          inv.ageBrackets.includes(ageBracket) &&
          (sexFilter === "all" || inv.applicableSex === "all" || inv.applicableSex === sexFilter),
      ),
    [copy.investigations, ageBracket, sexFilter],
  );

  const checkedInvestigations = useMemo(
    () => copy.investigations.filter((inv) => checkedIds.includes(inv.id)),
    [copy.investigations, checkedIds],
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: "recommendations", label: `${copy.tabRecommendations} (${filteredInvestigations.length})` },
    { key: "timeline", label: copy.tabTimeline },
    { key: "checklist", label: `${copy.tabChecklist} (${checkedIds.length})` },
  ];

  const handlePrintChecklist = () => {
    const root = document.documentElement;
    root.setAttribute("data-print-mode", "screening-checklist");
    const cleanup = () => {
      root.removeAttribute("data-print-mode");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    setTimeout(cleanup, 1000);
  };

  const segment = (selected: boolean) =>
    cn(
      "min-h-[44px] rounded-lg border px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire",
      selected
        ? "border-foreground bg-surface-subtle text-foreground"
        : "border-border bg-card text-foreground hover:border-foreground/30 hover:bg-surface-subtle/50",
    );

  return (
    <div
      className={cn("space-y-6 rounded-xl border border-border bg-card p-6 sm:p-8", className)}
      data-testid="preventive-screening-selector"
      data-print-screening-card
    >
      <div>
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {copy.sectionTitle}
        </h3>
        <p className="mt-1.5 max-w-[70ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
          {copy.sectionSubtitle}
        </p>
      </div>

      {/* Tabs: clean 3-column selector grid, hidden in print */}
      <div
        role="tablist"
        aria-label={ui.tabsLabel}
        className="grid grid-cols-1 gap-2.5 border-t border-border pt-6 sm:grid-cols-3 print:hidden"
      >
        {tabs.map((tab) => {
          const selected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`${id}-tab-${tab.key}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex min-h-[52px] items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire",
                selected
                  ? "border-foreground bg-surface-subtle text-foreground"
                  : "border-border bg-card text-foreground hover:border-foreground/30 hover:bg-surface-subtle/50",
              )}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${activeTab}`} className="space-y-6">
        {activeTab === "recommendations" && (
          <>
            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-x-8 print:hidden">
              <fieldset className="min-w-0">
                <legend className="mb-1.5 text-xs font-semibold text-muted-foreground">{copy.filterAgeLabel}</legend>
                <div role="radiogroup" className="grid grid-cols-4 gap-2 sm:inline-flex">
                  {AGE_BRACKETS.map((bracket) => (
                    <button
                      key={bracket}
                      type="button"
                      role="radio"
                      aria-checked={ageBracket === bracket}
                      onClick={() => setAgeBracket(bracket)}
                      className={segment(ageBracket === bracket)}
                    >
                      {copy.ageOptions[bracket]}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="min-w-0">
                <legend className="mb-1.5 text-xs font-semibold text-muted-foreground">{copy.filterSexLabel}</legend>
                <div role="radiogroup" className="grid grid-cols-3 gap-2 sm:inline-flex">
                  {SEX_FILTERS.map((sex) => (
                    <button
                      key={sex}
                      type="button"
                      role="radio"
                      aria-checked={sexFilter === sex}
                      onClick={() => setSexFilter(sex)}
                      className={segment(sexFilter === sex)}
                    >
                      {copy.sexOptions[sex]}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Checks */}
            {filteredInvestigations.length === 0 ? (
              <p className="border-t border-border pt-6 text-sm text-muted-foreground">{copy.noResultsMessage}</p>
            ) : (
              <ul className="divide-y divide-border border-t border-border">
                {filteredInvestigations.map((inv) => {
                  const isChecked = checkedIds.includes(inv.id);
                  const checkboxId = `${id}-plan-${inv.id}`;
                  return (
                    <li key={inv.id} className="py-5 break-inside-avoid">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <h4 className="text-base font-bold leading-snug text-foreground">{inv.title}</h4>
                        <label
                          htmlFor={checkboxId}
                          className={cn(
                            "inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-2.5 self-start rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors print:hidden",
                            isChecked
                              ? "border-foreground bg-surface-subtle text-foreground"
                              : "border-border bg-card text-foreground hover:bg-surface-subtle/50",
                          )}
                        >
                          <input
                            id={checkboxId}
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCheck(inv.id)}
                            className="h-4 w-4 accent-foreground"
                          />
                          {ui.inPlan}
                        </label>
                      </div>

                      <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-[max-content_minmax(0,1fr)]">
                        <dt className="font-medium text-muted-foreground">{copy.frequencyLabel}</dt>
                        <dd className="text-foreground">{inv.frequency}</dd>
                        <dt className="font-medium text-muted-foreground">{copy.cnasLabel}</dt>
                        <dd className="text-foreground">{inv.cnasBadge}</dd>
                        <dt className="font-medium text-muted-foreground">{copy.preparationLabel}</dt>
                        <dd className="text-foreground">{inv.preparation}</dd>
                      </dl>

                      <details className="group mt-3">
                        <summary className="inline-flex min-h-[44px] cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-foreground underline underline-offset-4 hover:text-muted-foreground [&::-webkit-details-marker]:hidden print:hidden">
                          {ui.details}
                          <ChevronDownIcon className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                        </summary>
                        <div className="mt-2 space-y-2 border-l-2 border-border pl-4 text-sm leading-relaxed">
                          <p>
                            <span className="font-semibold text-foreground">{copy.earlyBenefitLabel}. </span>
                            <span className="text-muted-foreground">{inv.earlyBenefit}</span>
                          </p>
                          <p>
                            <span className="font-semibold text-foreground">{copy.doctorQuestionLabel}: </span>
                            <span className="text-muted-foreground">
                              {ui.quote[0]}
                              {inv.doctorQuestion}
                              {ui.quote[1]}
                            </span>
                          </p>
                        </div>
                      </details>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {activeTab === "timeline" && (
          <div className="grid grid-cols-1 gap-6 border-t border-border pt-6 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-surface-subtle/50">
                <LazyMotion features={domAnimation} strict>
                  <PreventiveScreeningScene step={timelineStep} playing={false} />
                </LazyMotion>
              </div>
              <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
                {ui.step.replace("{n}", String(timelineStep + 1)).replace("{total}", String(copy.timelineSteps.length))}:{" "}
                <span className="font-semibold text-foreground">{copy.timelineSteps[timelineStep]?.title}</span>
              </p>
            </div>
            <ol className="divide-y divide-border border-y border-border lg:col-span-7">
              {copy.timelineSteps.map((stepItem, idx) => {
                const isActive = timelineStep === idx;
                return (
                  <li key={stepItem.stepNumber}>
                    <button
                      type="button"
                      aria-current={isActive ? "step" : undefined}
                      onClick={() => setTimelineStep(idx)}
                      className={cn(
                        "flex w-full items-start gap-3 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire",
                        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums",
                          isActive ? "bg-foreground text-white" : "bg-surface-subtle text-muted-foreground",
                        )}
                      >
                        {stepItem.stepNumber}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-foreground">{stepItem.title}</span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">{stepItem.description}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {activeTab === "checklist" && (
          <div className="border-t border-border pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="text-base font-bold text-foreground">{copy.checklistTitle}</h4>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {checkedIds.length > 0
                    ? copy.checklistCounter
                        .replace("{completed}", String(checkedInvestigations.length))
                        .replace("{total}", String(copy.investigations.length))
                    : copy.checklistSubtitle}
                </p>
              </div>
              {checkedInvestigations.length > 0 && (
                <button
                  type="button"
                  onClick={handlePrintChecklist}
                  className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-surface-subtle print:hidden"
                >
                  <PrinterIcon className="h-4 w-4" aria-hidden="true" />
                  {copy.printChecklistButton}
                </button>
              )}
            </div>

            {checkedInvestigations.length === 0 ? (
              <div className="mt-6 border-t border-border pt-6">
                <p className="text-sm text-muted-foreground">{copy.checklistEmpty}</p>
                <button
                  type="button"
                  onClick={() => setActiveTab("recommendations")}
                  className="mt-3 inline-flex min-h-[44px] items-center text-sm font-semibold text-foreground underline underline-offset-4 hover:text-muted-foreground print:hidden"
                >
                  {copy.tabRecommendations}
                </button>
              </div>
            ) : (
              <ul className="mt-5 divide-y divide-border border-y border-border">
                {checkedInvestigations.map((inv) => (
                  <li key={inv.id} className="py-4 break-inside-avoid">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1.5">
                        <p className="text-base font-bold text-foreground">{inv.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {inv.frequency} · {inv.cnasBadge}
                        </p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          <span className="font-semibold text-foreground">{copy.preparationLabel}: </span>
                          {inv.preparation}
                        </p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          <span className="font-semibold text-foreground">{copy.doctorQuestionLabel}: </span>
                          {ui.quote[0]}
                          {inv.doctorQuestion}
                          {ui.quote[1]}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCheck(inv.id)}
                        className="inline-flex min-h-[44px] shrink-0 items-center self-start text-xs font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground sm:self-center print:hidden"
                      >
                        {ui.remove}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
