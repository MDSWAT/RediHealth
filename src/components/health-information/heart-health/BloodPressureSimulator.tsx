"use client";

import { useState } from "react";
import { AlertCircleIcon, ShieldIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import {
  evaluateBloodPressure,
  BP_PRESET_STRINGS,
  BP_SIMULATOR_UI_STRINGS,
  ESH_STEPPER_STRINGS,
} from "@/lib/simulators/blood-pressure-types";
import { HeartAnatomyPanel } from "./HeartAnatomyPanel";

export interface BloodPressureSimulatorProps {
  lang?: Lang;
}

interface BpPresetConfig {
  key: "optimal" | "high_normal" | "grade_1" | "grade_2" | "crisis";
  systolic: number;
  diastolic: number;
  hasRedFlags?: boolean;
}

const BP_PRESETS: BpPresetConfig[] = [
  { key: "optimal", systolic: 115, diastolic: 75 },
  { key: "high_normal", systolic: 135, diastolic: 85 },
  { key: "grade_1", systolic: 148, diastolic: 94 },
  { key: "grade_2", systolic: 165, diastolic: 102 },
  { key: "crisis", systolic: 185, diastolic: 122, hasRedFlags: true },
];

const SECTION_CLASS =
  "rounded-lg border border-border bg-card p-5 shadow-xs sm:p-7";

function useSafeLang(langProp?: Lang): Lang {
  let hookLang: Lang = "ro";
  try {
    const ctx = useLanguage();
    if (ctx?.lang) hookLang = ctx.lang;
  } catch {
    // outside LanguageProvider
  }
  return langProp ?? hookLang;
}

export function BloodPressureSimulator({ lang: langProp }: BloodPressureSimulatorProps) {
  const lang = useSafeLang(langProp);

  const [systolic, setSystolic] = useState<number>(124);
  const [diastolic, setDiastolic] = useState<number>(78);
  const [hasRedFlags, setHasRedFlags] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const evaluation = evaluateBloodPressure(systolic, diastolic, { hasRedFlags, lang });
  const ui = BP_SIMULATOR_UI_STRINGS;
  const esh = ESH_STEPPER_STRINGS;
  const steps = esh.steps;
  const currentStep = steps[activeStepIndex] ?? steps[0];

  const tone =
    evaluation.badgeTone === "sage"
      ? {
          badge: "border-live-sage/35 bg-live-sage-soft/50 text-foreground",
          dot: "bg-live-sage",
        }
      : evaluation.badgeTone === "amber"
        ? {
            badge: "border-amber-care-border bg-amber-care-soft/60 text-foreground",
            dot: "bg-amber-care",
          }
        : {
            badge: "border-primary/35 bg-primary-soft/60 text-primary",
            dot: "bg-primary",
          };

  const stageCountLabel = esh.stageCountTemplate[lang]
    .replace("{current}", String(activeStepIndex + 1))
    .replace("{total}", String(steps.length));

  const sliders = [
    {
      id: "bp-systolic-slider",
      label: ui.systolicLabel[lang],
      hint: ui.systolicSubtext[lang],
      value: systolic,
      min: 70,
      max: 220,
      ticks: ["70", "120", "140", "180+"],
      onChange: setSystolic,
    },
    {
      id: "bp-diastolic-slider",
      label: ui.diastolicLabel[lang],
      hint: ui.diastolicSubtext[lang],
      value: diastolic,
      min: 40,
      max: 140,
      ticks: ["40", "80", "90", "120+"],
      onChange: setDiastolic,
    },
  ];

  return (
    <div className="space-y-8" data-testid="heart-health-interactive-suite">
      {/* 1. What the two numbers mean */}
      <section aria-labelledby="bp-simulator-title" className={SECTION_CLASS}>
        <h3 id="bp-simulator-title" className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {ui.title[lang]}
        </h3>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
          {ui.subtitle[lang]}
        </p>

        <div className="mt-5">
          <p className="text-xs font-medium text-muted-foreground">{ui.quickExamples[lang]}</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:flex sm:items-center">
            {BP_PRESETS.map((preset) => {
              const isSelected =
                systolic === preset.systolic &&
                diastolic === preset.diastolic &&
                hasRedFlags === Boolean(preset.hasRedFlags);
              return (
                <button
                  key={preset.key}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSystolic(preset.systolic);
                    setDiastolic(preset.diastolic);
                    setHasRedFlags(Boolean(preset.hasRedFlags));
                  }}
                  className={`inline-flex min-h-[40px] items-center justify-center rounded-lg border px-2 text-center text-xs font-semibold leading-tight tracking-[-0.01em] tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire sm:flex-1 sm:whitespace-nowrap ${
                    isSelected
                      ? "border-foreground bg-foreground text-white"
                      : "border-border bg-card text-foreground hover:border-foreground/40 hover:bg-muted/40"
                  }`}
                >
                  {BP_PRESET_STRINGS[preset.key][lang]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-border pt-6 md:grid-cols-2">
          {sliders.map((s) => (
            <div key={s.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor={s.id} className="text-sm font-semibold text-foreground">
                    {s.label}
                  </label>
                  <span className="shrink-0 text-2xl font-semibold tabular-nums text-foreground">
                    {s.value}{" "}
                    <span className="text-xs font-normal text-muted-foreground">mmHg</span>
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.hint}</p>
              </div>
              <div className="mt-3 pt-1">
                <input
                  id={s.id}
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={1}
                  value={s.value}
                  onChange={(e) => s.onChange(Number(e.target.value))}
                  aria-valuetext={`${s.value} mmHg, ${evaluation.label[lang]}`}
                  className="w-full cursor-pointer accent-sapphire"
                />
                <div className="mt-1 flex justify-between text-xs tabular-nums text-muted-foreground" aria-hidden="true">
                  {s.ticks.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <label
          className={`mt-6 flex min-h-[48px] cursor-pointer items-start gap-3 rounded-lg border px-4 py-3.5 text-sm text-foreground transition-colors ${
            hasRedFlags
              ? "border-primary/40 bg-primary-soft/30"
              : "border-border bg-card hover:border-foreground/30 hover:bg-muted/30"
          }`}
        >
          <input
            type="checkbox"
            checked={hasRedFlags}
            onChange={(e) => setHasRedFlags(e.target.checked)}
            className="sr-only"
          />
          <span
            aria-hidden="true"
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
              hasRedFlags
                ? "border-primary bg-primary text-white"
                : "border-border bg-card"
            }`}
          >
            {hasRedFlags && (
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3.5 8.5L6.5 11.5L12.5 4.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span className="leading-relaxed">{ui.redFlagCheckbox[lang]}</span>
        </label>

        <div role="status" aria-live="polite" className="mt-6 border-t border-border pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl">
                {systolic}/{diastolic}
              </span>
              <span className="text-sm text-muted-foreground">mmHg</span>
            </div>
            <span className={`inline-flex items-center rounded-md border px-3 py-1 text-xs font-semibold sm:text-sm ${tone.badge}`}>
              {evaluation.label[lang]}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-6 border-t border-border/70 pt-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {ui.physiologicLabel[lang].replace(/:$/, "")}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {evaluation.physiologicEffect[lang]}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {ui.actionProtocolLabel[lang].replace(/:$/, "")}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {evaluation.actionProtocol[lang]}
              </p>
            </div>
          </div>

          {evaluation.isEmergency112 && (
            <div className="mt-4 flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary-soft/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium leading-relaxed text-foreground">{ui.emergencyNotice[lang]}</p>
              <a
                href="tel:112"
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {ui.call112Btn[lang]}
              </a>
            </div>
          )}
        </div>

        <HeartAnatomyPanel lang={lang} className="mt-8 border-t border-border pt-7" />

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">{ui.guidelineBadge[lang]}</p>
      </section>

      {/* 2. Measuring at home, step by step */}
      <section aria-labelledby="bp-steps-title" className={SECTION_CLASS}>
        <h3 id="bp-steps-title" className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {esh.headerTitle[lang]}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{esh.headerEyebrow[lang]}</p>

        <ol className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {steps.map((st, idx) => {
            const isCurrent = idx === activeStepIndex;
            return (
              <li key={st.number}>
                <button
                  type="button"
                  onClick={() => setActiveStepIndex(idx)}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`flex h-full min-h-[52px] w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                    isCurrent
                      ? "border-foreground bg-surface-subtle"
                      : "border-border bg-card hover:border-foreground/40 hover:bg-muted/30"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums ${
                      isCurrent ? "bg-foreground text-background" : "border border-border text-muted-foreground"
                    }`}
                  >
                    {st.number}
                  </span>
                  <span className="text-sm font-semibold leading-snug text-foreground break-words">
                    <span className="sr-only">{esh.stepPrefix[lang]} {st.number}: </span>
                    {st.title[lang]}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 border-t border-border pt-5" aria-live="polite">
          <p className="max-w-prose text-base leading-relaxed text-foreground">
            <span className="font-semibold">{esh.actionLabel[lang]}</span> {currentStep.action[lang]}
          </p>

          <div className="mt-5 grid grid-cols-1 gap-6 border-t border-border/70 pt-5 sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldIcon className="h-4 w-4 shrink-0 text-live-sage" />
                {esh.doctorTipLabel[lang]}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {currentStep.doctorTip[lang]}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <AlertCircleIcon className="h-4 w-4 shrink-0 text-amber-care" />
                {esh.mistakeLabel[lang]}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {currentStep.mistakeToAvoid[lang]}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeStepIndex === 0}
              className="inline-flex min-h-[44px] items-center rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire disabled:cursor-not-allowed disabled:opacity-40"
            >
              {esh.prevStep[lang]}
            </button>
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {stageCountLabel}
            </span>
            <button
              type="button"
              onClick={() => setActiveStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
              disabled={activeStepIndex === steps.length - 1}
              className="inline-flex min-h-[44px] items-center rounded-lg bg-foreground px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {esh.nextStep[lang]}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
