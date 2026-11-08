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
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const timer = setTimeout(() => setCheckedIds(JSON.parse(saved)), 0);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage access restricted
    }
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
          <div className="flex items-center gap-2 print:hidden">
            <span className="rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground">
              {s.completedBadge[currentLang]
                .replace("{completed}", String(completedCount))
                .replace("{total}", String(totalCount))}
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {steps.map((step) => {
          const isChecked = checkedIds.includes(step.id);
          return (
            <div
              key={step.id}
              className={`flex items-start justify-between gap-3 rounded-lg border p-4 transition-colors break-inside-avoid ${
                isChecked
                  ? "border-foreground bg-surface-subtle"
                  : "border-border bg-card hover:border-foreground/30"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleCheck(step.id)}
                className="flex flex-1 items-start gap-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire rounded-md"
                aria-pressed={isChecked}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    isChecked
                      ? "border-foreground bg-foreground text-white"
                      : "border-border bg-card"
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
