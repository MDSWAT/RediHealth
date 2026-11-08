"use client";

import { useState } from "react";
import { AlertCircleIcon, CheckCircleIcon, PhoneIcon } from "@/components/ui/icons";
import { EmergencyDialerGate } from "@/components/emergency/EmergencyDialerGate";
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
  "rounded-xl border border-border bg-card p-5 sm:p-7";

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
  const [dialerOpen, setDialerOpen] = useState(false);

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

  const sliders = [
    {
      id: "bp-systolic-slider",
      label: ui.systolicLabel[lang],
      hint: ui.systolicSubtext[lang],
      value: systolic,
      min: 80,
      max: 220,
      // A regular scale, every 20 mmHg, drawn where each value really sits on the bar.
      ticks: [80, 100, 120, 140, 160, 180, 200, 220],
      onChange: setSystolic,
    },
    {
      id: "bp-diastolic-slider",
      label: ui.diastolicLabel[lang],
      hint: ui.diastolicSubtext[lang],
      value: diastolic,
      min: 40,
      max: 140,
      ticks: [40, 60, 80, 100, 120, 140],
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
          {/* Phones: one row that scrolls sideways (no orphan chip). From sm up: equal cells. */}
          <div className="-mx-5 mt-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
          <div className="flex w-max gap-1.5 sm:w-auto">
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
                  className={`inline-flex min-h-[44px] shrink-0 items-center justify-center whitespace-nowrap rounded-lg border px-3 text-center text-xs font-semibold tabular-nums transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire sm:shrink sm:grow sm:basis-0 sm:px-2 sm:tracking-[-0.01em] ${
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
                {/*
                  The native thumb is 16px wide, so its centre travels from 8px to (100% - 8px).
                  Each value gets a hairline at its true position; the end labels align to the edges.
                */}
                <div className="relative mt-0.5 h-6 text-[11px] tabular-nums text-muted-foreground sm:text-xs" aria-hidden="true">
                  {s.ticks.map((t, i) => {
                    const left = `calc(8px + (100% - 16px) * ${(t - s.min) / (s.max - s.min)})`;
                    const edge = i === 0 ? "left-0" : i === s.ticks.length - 1 ? "right-0" : "-translate-x-1/2";
                    return (
                      <span key={t}>
                        <span className="absolute top-0 h-1 w-px bg-border" style={{ left }} />
                        <span
                          className={`absolute top-1.5 ${edge}`}
                          style={i === 0 || i === s.ticks.length - 1 ? undefined : { left }}
                        >
                          {t}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <label
          className={`mt-6 flex min-h-[48px] cursor-pointer items-start gap-3 rounded-lg border px-4 py-3.5 text-sm text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
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
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
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
            <div className="mt-4 flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold leading-relaxed text-foreground">{ui.emergencyNotice[lang]}</p>
              <button
                type="button"
                onClick={() => setDialerOpen(true)}
                aria-haspopup="dialog"
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <PhoneIcon className="h-4 w-4" />
                {ui.call112Btn[lang]}
              </button>
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

        {/* Step picker: one surface of numbered cells split by hairlines. */}
        <ol className="mt-5 grid grid-cols-1 divide-y divide-border overflow-hidden rounded-lg border border-border md:grid-cols-4 md:divide-x md:divide-y-0">
          {steps.map((st, idx) => {
            const isCurrent = idx === activeStepIndex;
            return (
              <li key={st.number}>
                <button
                  type="button"
                  onClick={() => setActiveStepIndex(idx)}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`flex h-full min-h-[52px] w-full items-center gap-3 px-3.5 py-3 text-left md:flex-col md:items-start md:gap-2 md:py-3.5 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire ${
                    isCurrent ? "bg-surface-subtle" : "bg-card hover:bg-surface-subtle/50"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums ${
                      isCurrent ? "bg-foreground text-white" : "bg-surface-subtle text-muted-foreground"
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
                <CheckCircleIcon className="h-4 w-4 shrink-0 text-live-sage" />
                {esh.goodToKnowLabel[lang]}
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

          {/* The picker above already shows which step is open, so there is no "Step 1 of 4" counter. */}
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeStepIndex === 0}
              className="-ml-3 inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:bg-transparent"
            >
              {esh.prevStep[lang]}
            </button>
            <button
              type="button"
              onClick={() => setActiveStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
              disabled={activeStepIndex === steps.length - 1}
              className="inline-flex min-h-[44px] items-center rounded-lg bg-foreground px-4 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              {esh.nextStep[lang]}
            </button>
          </div>
        </div>
      </section>

      <EmergencyDialerGate open={dialerOpen} onOpenChange={setDialerOpen} />
    </div>
  );
}
