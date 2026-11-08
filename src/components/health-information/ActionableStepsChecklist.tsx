"use client";

import { useState, useEffect } from "react";
import { InlineAudioNarratorButton } from "./InlineAudioNarratorButton";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import {
  HEALTH_DETAIL_SHARED_STRINGS,
  SPEECH_LANG_BY_LOCALE,
} from "@/lib/i18n/health-myths";

export interface StepItem {
  id: string;
  title: string;
  description: string;
}

export interface ActionableStepsChecklistProps {
  slug: string;
  topicTitle: string;
  recommendations?: { title: string; description: string }[];
  className?: string;
  lang?: Lang;
}

function useSafeLanguageContext(): { lang: Lang } {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" };
  }
}

export function ActionableStepsChecklist({
  slug,
  topicTitle,
  recommendations = [],
  className = "",
  lang,
}: ActionableStepsChecklistProps) {
  const { lang: ctxLang } = useSafeLanguageContext();
  const currentLang: Lang = lang ?? ctxLang ?? "ro";
  const s = HEALTH_DETAIL_SHARED_STRINGS.actionableSteps;
  const speechLang = SPEECH_LANG_BY_LOCALE[currentLang] ?? "ro-RO";

  const storageKey = `redihealth_habits_${slug}`;
  // Starts empty on the server and on first paint; saved ticks load after hydration.
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  useEffect(() => {
    let saved: unknown = null;
    try {
      saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    } catch {
      // LocalStorage access restricted or corrupt
    }
    if (!Array.isArray(saved)) return;
    const ids = saved.filter((id): id is string => typeof id === "string");
    const timer = setTimeout(() => setCheckedIds(ids), 0);
    return () => clearTimeout(timer);
  }, [storageKey]);

  const toggleCheck = (id: string) => {
    const updated = checkedIds.includes(id)
      ? checkedIds.filter((item) => item !== id)
      : [...checkedIds, id];

    setCheckedIds(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // LocalStorage access restricted
    }
  };

  const steps: StepItem[] = recommendations.map((rec, index) => ({
    id: `step-${index}`,
    title: rec.title,
    description: rec.description,
  }));

  const completedCount = checkedIds.length;
  const totalCount = steps.length;

  return (
    <section aria-labelledby="steps-heading" className={className}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="steps-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {s.heading[currentLang]}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {s.subtitleTemplate[currentLang].replace("{topic}", topicTitle.toLowerCase())}
          </p>
        </div>

        {totalCount > 0 && (
          <div className="print:hidden">
            <span className="text-sm font-medium tabular-nums text-muted-foreground">
              {s.completedBadge[currentLang]
                .replace("{completed}", String(completedCount))
                .replace("{total}", String(totalCount))}
            </span>
          </div>
        )}
      </div>

      <ul className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {steps.map((step) => {
          const isChecked = checkedIds.includes(step.id);
          return (
            <li
              key={step.id}
              className={`flex items-start justify-between gap-3 px-4 py-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] break-inside-avoid sm:px-5 ${
                isChecked ? "bg-surface-subtle" : "hover:bg-muted/30"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleCheck(step.id)}
                className="flex flex-1 items-start gap-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire rounded-md"
                aria-pressed={isChecked}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-[var(--dur-fast)] ${
                    isChecked
                      ? "border-foreground bg-foreground text-white"
                      : "border-foreground/30 bg-card"
                  }`}
                  aria-hidden="true"
                >
                  {isChecked && (
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>

                <div>
                  <h3 className="text-base font-semibold leading-snug text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </button>

              <InlineAudioNarratorButton
                textToSpeak={`${step.title}. ${step.description}`}
                label={s.listenStepLabel[currentLang].replace("{title}", step.title)}
                lang={speechLang}
                variant="ghost"
                className="-my-2 -mr-2 shrink-0"
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
