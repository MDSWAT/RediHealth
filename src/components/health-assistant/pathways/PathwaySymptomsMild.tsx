"use client";

import Link from "next/link";
import { AlertCircleIcon, PhoneIcon, StethoscopeIcon } from "@/components/ui/icons";
import { UniversalDoctorExit } from "@/components/health-assistant/UniversalDoctorExit";
import { type MildCategoryId, useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";

interface PathwaySymptomsMildProps {
  step: 2 | 3;
  hasEmergencySigns?: boolean;
  mildCategory?: string;
  onSelectCategory: (category: string) => void;
  plainLanguage: boolean;
}

const CATEGORY_IDS: MildCategoryId[] = ["fever", "headache", "stomach", "cough"];

export function PathwaySymptomsMild({
  step,
  hasEmergencySigns,
  mildCategory,
  onSelectCategory,
  plainLanguage,
}: PathwaySymptomsMildProps) {
  const { lang } = useLanguage();
  const { symptoms } = useAssistantCopy();

  // Emergency result: one clear action, calm wording, no alarm styling beyond what the moment needs.
  if (step === 3 && hasEmergencySigns) {
    return (
      <div>
        <div className="rounded-lg border border-red-200 bg-red-50/70 p-5 dark:border-red-900/50 dark:bg-red-950/20 sm:p-6">
          <h2 className="flex items-start gap-2.5 text-xl font-semibold text-red-950 dark:text-red-100">
            <AlertCircleIcon className="mt-1 h-5 w-5 shrink-0 text-red-700 dark:text-red-300" />
            <span>{symptoms.emergencyHeading}</span>
          </h2>
          <p className="mt-2 max-w-prose text-base leading-relaxed text-red-950 dark:text-red-100">
            {symptoms.emergencyBody}
          </p>

          <a
            href="tel:112"
            className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-red-700 px-6 py-3 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-red-800 sm:w-auto"
          >
            <PhoneIcon className="h-5 w-5" />
            <span>{symptoms.callNow}</span>
          </a>

          <h3 className="mt-6 text-sm font-semibold text-red-950 dark:text-red-100">{symptoms.callTipsTitle}</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-red-950 marker:text-red-800 dark:text-red-100 dark:marker:text-red-300">
            {symptoms.callTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ol>
        </div>

        <UniversalDoctorExit
          pathway="emergency"
          title={symptoms.emergencyExitTitle}
          description={symptoms.emergencyExitBody}
        />
      </div>
    );
  }

  if (step === 2) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-foreground">{symptoms.heading}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{symptoms.lead}</p>

        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CATEGORY_IDS.map((id) => {
            const category = symptoms.categories[id];
            return (
              <li key={id}>
                <button
                  type="button"
                  data-triage-option={id}
                  onClick={() => onSelectCategory(id)}
                  className="flex h-full min-h-[56px] w-full flex-col items-start rounded-lg border border-border bg-card p-4 text-left transition-colors duration-[var(--dur-fast)] hover:border-primary/40 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="text-sm font-semibold text-foreground">{category.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{category.desc}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const currentId = CATEGORY_IDS.find((id) => id === mildCategory) ?? CATEGORY_IDS[0];
  const current = symptoms.categories[currentId];

  return (
    <div>
      <p className="text-sm text-muted-foreground">{symptoms.selectedLabel}</p>
      <h2 className="mt-0.5 text-lg font-semibold text-foreground">{current.title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{current.desc}</p>

      <p className="mt-5 max-w-prose text-base leading-relaxed text-foreground">
        {plainLanguage ? symptoms.plainBody : symptoms.body}
      </p>

      <Link
        href={withLangPrefix(`/medic-online?queue=now&category=${currentId}`, lang)}
        className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-center text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-primary/90 sm:w-auto"
      >
        <StethoscopeIcon className="h-4 w-4" />
        <span>{symptoms.cta}</span>
      </Link>

      <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
        <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-700 dark:text-red-300" />
        <span>{symptoms.safetyNet}</span>
      </p>

      <UniversalDoctorExit pathway="symptoms" summary={symptoms.summary(current.title)} />
    </div>
  );
}
