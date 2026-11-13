"use client";

import { useState, useEffect } from "react";
import { HEALTH_ARTICLE_SECTION_H2_CLASS } from "./HealthArticleShell";
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

const RESET_LABELS: Record<Lang, string> = {
  ru: "Сбросить",
  ro: "Resetează",
  en: "Reset",
  sq: "Rivendos",
  it: "Azzera",
  hr: "Poništi",
  rom: "Ker palpal",
};

function useSafeLanguageContext(): { lang: Lang } {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" };
  }
}

function pickLocale(
  entry: Record<"ro", string> & Partial<Record<Lang, string>>,
  lang: Lang,
): string {
  return entry[lang] ?? entry.ro;
}

function pickSpeechLang(lang: Lang): string {
  return (
    (SPEECH_LANG_BY_LOCALE as Partial<Record<Lang, string>>)[lang] ??
    (lang === "hr" ? "hr-HR" : "ro-RO")
  );
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
  const speechLang = pickSpeechLang(currentLang);

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

  const resetChecks = () => {
    setCheckedIds([]);
    try {
      localStorage.removeItem(storageKey);
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
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 id="steps-heading" className={HEALTH_ARTICLE_SECTION_H2_CLASS}>
            {pickLocale(s.heading, currentLang)}
          </h2>
          <p className="mt-1.5 text-base text-muted-foreground">
            {pickLocale(s.subtitleTemplate, currentLang).replace(
              "{topic}",
              topicTitle.toLowerCase(),
            )}
          </p>

          {totalCount > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-3 print:hidden">
              <span className="text-base font-medium tabular-nums text-muted-foreground">
                {pickLocale(s.completedBadge, currentLang)
                  .replace("{completed}", String(completedCount))
                  .replace("{total}", String(totalCount))}
              </span>
              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={resetChecks}
                  className="inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-2.5 text-base font-semibold text-sapphire underline underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft/50 hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
                >
                  {RESET_LABELS[currentLang] ?? RESET_LABELS.ro}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 self-start">
          <InlineAudioNarratorButton
            textToSpeak={`${pickLocale(s.heading, currentLang)}. ${steps
              .map((step, i) => `${i + 1}. ${step.title}. ${step.description}`)
              .join(" ")}`}
            label={pickLocale(s.heading, currentLang)}
            lang={speechLang}
          />
        </div>
      </div>

      <ul className="mt-5 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {steps.map((step) => {
          const isChecked = checkedIds.includes(step.id);
          return (
            <li
              key={step.id}
              className={`transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] break-inside-avoid ${
                isChecked ? "bg-surface-subtle" : "hover:bg-muted/30"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleCheck(step.id)}
                className="flex w-full items-start gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire sm:px-6 sm:py-5"
                aria-pressed={isChecked}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-[var(--dur-fast)] ${
                    isChecked
                      ? "border-foreground bg-foreground text-white"
                      : "border-foreground/35 bg-card"
                  }`}
                  aria-hidden="true"
                >
                  {isChecked && (
                    <svg
                      className="h-4 w-4"
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
                  <h3 className="text-lg font-semibold leading-snug text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-base leading-[1.65] text-foreground/90">
                    {step.description}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
