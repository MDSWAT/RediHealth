"use client";

import { useId, type KeyboardEvent as ReactKeyboardEvent } from "react";
import Link from "next/link";
import { AlertCircleIcon, ArrowRightIcon, ChevronRightIcon, PhoneIcon } from "@/components/ui/icons";
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

function handleRadioGroupKeyDown(e: ReactKeyboardEvent<HTMLElement>) {
  const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
  if (!keys.includes(e.key)) return;
  const radios = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'));
  const currentIdx = radios.indexOf(document.activeElement as HTMLElement);
  if (currentIdx < 0) return;
  e.preventDefault();
  const nextIdx =
    e.key === "Home"
      ? 0
      : e.key === "End"
        ? radios.length - 1
        : e.key === "ArrowDown" || e.key === "ArrowRight"
          ? (currentIdx + 1) % radios.length
          : (currentIdx - 1 + radios.length) % radios.length;
  radios[nextIdx]?.focus();
}

export function PathwaySymptomsMild({
  step,
  hasEmergencySigns,
  mildCategory,
  onSelectCategory,
  plainLanguage,
}: PathwaySymptomsMildProps) {
  const { symptoms } = useAssistantCopy();
  const { lang } = useLanguage();
  const headingId = useId();

  // Emergency result: one clear action, calm wording, tokenized clinical-ruby styling.
  if (step === 3 && hasEmergencySigns) {
    return (
      <div>
        <div className="rounded-lg border border-primary/30 bg-primary-soft/55 p-5 sm:p-6">
          <h2 className="flex items-start gap-2.5 text-xl font-semibold text-foreground">
            <AlertCircleIcon className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <span>{symptoms.emergencyHeading}</span>
          </h2>
          <p className="mt-2 max-w-prose text-base leading-relaxed text-foreground">
            {symptoms.emergencyBody}
          </p>

          <a
            href="tel:112"
            className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto"
          >
            <PhoneIcon className="h-5 w-5" aria-hidden="true" />
            <span>{symptoms.callNow}</span>
          </a>

          <h3 className="mt-6 text-sm font-semibold text-foreground">{symptoms.callTipsTitle}</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-foreground marker:text-primary">
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
        <h2 id={headingId} className="text-lg font-semibold text-foreground">
          {symptoms.heading}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{symptoms.lead}</p>

        <div
          role="radiogroup"
          aria-labelledby={headingId}
          onKeyDown={handleRadioGroupKeyDown}
          className="mt-5 divide-y divide-border overflow-hidden rounded-lg border border-border"
        >
          {CATEGORY_IDS.map((id, idx) => {
            const category = symptoms.categories[id];
            const checked = mildCategory === id;
            const focusable = checked || (!mildCategory && idx === 0);
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={checked}
                tabIndex={focusable ? 0 : -1}
                data-triage-option={id}
                onClick={() => onSelectCategory(id)}
                className={`flex min-h-[56px] w-full items-start gap-3.5 px-4 py-4 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire sm:px-5 ${
                  checked ? "bg-sapphire-soft/60" : "bg-card hover:bg-muted/50"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-1 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                    checked ? "border-sapphire" : "border-foreground/55"
                  }`}
                >
                  {checked && <span className="h-2 w-2 rounded-full bg-sapphire" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold text-foreground">{category.title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">{category.desc}</span>
                </span>
                <ChevronRightIcon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-2.5 rounded-lg border border-sapphire/25 bg-sapphire-soft/50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-snug text-foreground">{symptoms.bodyMapHint}</p>
          <Link
            href={withLangPrefix("/health-check", lang)}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-sapphire/30 bg-card px-3.5 py-2 text-sm font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2"
          >
            <span>{symptoms.bodyMapCta}</span>
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  const currentId = CATEGORY_IDS.find((id) => id === mildCategory) ?? CATEGORY_IDS[0];
  const current = symptoms.categories[currentId];
  const homeCareTips = symptoms.homeCareByCategory[currentId];

  return (
    <div>
      <p className="text-sm text-muted-foreground">{symptoms.selectedLabel}</p>
      <h2 className="mt-0.5 text-lg font-semibold text-foreground">{current.title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{current.desc}</p>

      <p className="mt-4 max-w-prose text-base leading-relaxed text-foreground">
        {plainLanguage ? symptoms.plainBody : symptoms.body}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-4">
          <h3 className="text-sm font-semibold text-foreground">{symptoms.homeCareHeading}</h3>
          <ul className="mt-2.5 space-y-2 pl-4 text-sm leading-relaxed text-foreground">
            {homeCareTips.map((tip) => (
              <li key={tip} className="list-disc marker:text-sapphire">
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary-soft/55 p-4">
          <h3 className="flex items-start gap-2 text-sm font-semibold text-foreground">
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span>{symptoms.whenToCallHeading}</span>
          </h3>
          <ul className="mt-2.5 space-y-2 pl-4 text-sm leading-relaxed text-foreground">
            {symptoms.whenToCallTips.map((tip) => (
              <li key={tip} className="list-disc marker:text-primary">
                {tip}
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-primary/20 pt-2.5 text-xs font-medium leading-relaxed text-foreground">
            {symptoms.safetyNet}
          </p>
        </div>
      </div>

      <UniversalDoctorExit pathway="symptoms" summary={symptoms.summary(current.title)} />
    </div>
  );
}
