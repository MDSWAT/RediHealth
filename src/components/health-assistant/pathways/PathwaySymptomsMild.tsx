"use client";

import { useId, type KeyboardEvent as ReactKeyboardEvent } from "react";
import Link from "next/link";
import { ArrowRightIcon, PhoneIcon } from "@/components/ui/icons";
import { UniversalDoctorExit } from "@/components/health-assistant/UniversalDoctorExit";
import { type MildCategoryId, useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import {
  dangerPanel,
  emergencyButton,
  optionArrow,
  optionDesc,
  optionRow,
  optionRowSelected,
  optionTitle,
  stepHeading,
  stepLead,
  subHeading,
  textLink,
  textLinkLabel,
} from "@/components/health-assistant/step-ui";
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
        <div className={dangerPanel}>
          <h2 className={stepHeading}>
            {symptoms.emergencyHeading}
          </h2>
          <p className="mt-2 max-w-prose text-base leading-relaxed text-foreground">
            {symptoms.emergencyBody}
          </p>

          <a
            href="tel:112"
            className={`mt-5 w-full whitespace-nowrap sm:w-auto ${emergencyButton}`}
          >
            <PhoneIcon className="h-5 w-5" aria-hidden="true" />
            <span>{symptoms.callNow}</span>
          </a>

          <h3 className={`mt-6 ${subHeading}`}>{symptoms.callTipsTitle}</h3>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-base leading-relaxed text-foreground marker:text-sapphire">
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
        <h2 id={headingId} className={stepHeading}>
          {symptoms.heading}
        </h2>
        <p className={stepLead}>{symptoms.lead}</p>

        <div
          role="radiogroup"
          aria-labelledby={headingId}
          onKeyDown={handleRadioGroupKeyDown}
          className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
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
                className={checked ? optionRowSelected : optionRow}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 transition-colors duration-[var(--dur-fast)] ${
                    checked ? "border-sapphire" : "border-border-control group-hover:border-sapphire/70"
                  }`}
                >
                  {checked && <span className="h-2.5 w-2.5 rounded-xs bg-sapphire" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={optionTitle}>{category.title}</span>
                  <span className={optionDesc}>{category.desc}</span>
                </span>
                <ArrowRightIcon className={optionArrow} aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground">
          <span>{symptoms.bodyMapHint}</span>
          <Link href={withLangPrefix("/health-check", lang)} className={`max-w-full whitespace-nowrap text-sm sm:text-[0.9375rem] ${textLink}`}>
            <span className={`min-w-0 truncate ${textLinkLabel}`}>{symptoms.bodyMapCta}</span>
            <ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Link>
        </p>
      </div>
    );
  }

  const currentId = CATEGORY_IDS.find((id) => id === mildCategory) ?? CATEGORY_IDS[0];
  const current = symptoms.categories[currentId];
  const homeCareTips = symptoms.homeCareByCategory[currentId];

  return (
    <div>
      <p className="text-sm text-muted-foreground">{symptoms.selectedLabel}</p>
      <h2 className={`mt-1 ${stepHeading}`}>{current.title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{current.desc}</p>

      <p className="mt-5 max-w-prose text-base leading-relaxed text-foreground">
        {plainLanguage ? symptoms.plainBody : symptoms.body}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border p-5 sm:p-6">
          <h3 className={subHeading}>{symptoms.homeCareHeading}</h3>
          <ul className="mt-3 space-y-2 pl-4 text-sm leading-relaxed text-foreground">
            {homeCareTips.map((tip) => (
              <li key={tip} className="list-disc marker:text-sapphire">
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className={dangerPanel}>
          <h3 className={`text-balance ${subHeading}`}>
            {symptoms.whenToCallHeading}
          </h3>
          <ul className="mt-3 space-y-2 pl-4 text-sm leading-relaxed text-foreground">
            {symptoms.whenToCallTips.map((tip) => (
              <li key={tip} className="list-disc marker:text-primary">
                {tip}
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-primary/20 pt-3 text-sm font-medium leading-relaxed shrink-0 text-primary">
            {symptoms.safetyNet}
          </p>
        </div>
      </div>

      <UniversalDoctorExit pathway="symptoms" summary={symptoms.summary(current.title)} />
    </div>
  );
}
