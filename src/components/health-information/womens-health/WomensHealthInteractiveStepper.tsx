"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { LazyMotion, domAnimation } from "motion/react";
import type { Lang } from "@/lib/i18n/translations";
import { cn } from "@/lib/cn";
import { AlertCircleIcon, CheckIcon, PhoneIcon } from "@/components/ui/icons";
import { WOMENS_HEALTH_COPY } from "./womens-health-copy";
import { WomensHealthScene } from "./WomensHealthScene";

interface WomensHealthInteractiveStepperProps {
  lang: Lang;
  className?: string;
}

type Track = "pregnancy" | "screening";
type CheckId = "breast-awareness" | "cervical-screening";
const TRACKS: Track[] = ["pregnancy", "screening"];

/** Arrow-key movement for a radiogroup of buttons. */
function useRovingRadio<T>(items: T[], value: T, onChange: (next: T) => void) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const index = Math.min(Math.max(items.indexOf(value) + delta, 0), items.length - 1);
    onChange(items[index]);
    refs.current[index]?.focus();
  };
  return { refs, onKeyDown };
}

/** Women's health explainer: pregnancy by trimester (WHO antenatal timeline) and breast / cervical checks. */
export function WomensHealthInteractiveStepper({ lang, className = "" }: WomensHealthInteractiveStepperProps) {
  const copy = WOMENS_HEALTH_COPY[lang] || WOMENS_HEALTH_COPY.ro;
  const id = useId();

  const [track, setTrack] = useState<Track>("pregnancy");
  const [trimester, setTrimester] = useState(0);
  const [checkId, setCheckId] = useState<CheckId>("breast-awareness");

  const steps = copy.pregnancyTrack.steps;
  const current = steps[trimester] ?? steps[0];
  const [breast, cervical] = copy.screeningTrack.hotspots;

  const trackTabs = useRovingRadio(TRACKS, track, setTrack);
  const trimesterRadio = useRovingRadio(
    steps.map((_, i) => i),
    trimester,
    setTrimester,
  );
  const checkRadio = useRovingRadio<CheckId>(["breast-awareness", "cervical-screening"], checkId, setCheckId);

  return (
    <div
      className={cn("space-y-6 rounded-xl border border-border bg-card p-6 sm:p-8", className)}
      data-testid="womens-health-stepper"
    >
      <div>
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{copy.title}</h3>
        <p className="mt-1.5 max-w-[65ch] text-sm leading-relaxed text-muted-foreground sm:text-base">{copy.subtitle}</p>
      </div>

      {/* Track selector — clean 2-column grid */}
      <div
        role="tablist"
        aria-label={copy.trackAriaLabel}
        className="grid grid-cols-1 gap-2.5 border-t border-border pt-6 sm:grid-cols-2"
      >
        {TRACKS.map((t, index) => {
          const selected = track === t;
          return (
            <button
              key={t}
              ref={(node) => {
                trackTabs.refs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${t}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTrack(t)}
              onKeyDown={trackTabs.onKeyDown}
              className={cn(
                "flex min-h-[52px] items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire",
                selected
                  ? "border-foreground bg-surface-subtle text-foreground"
                  : "border-border bg-card text-foreground hover:border-foreground/30 hover:bg-surface-subtle/50",
              )}
            >
              <span>{copy.tabs[t]}</span>
            </button>
          );
        })}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${track}`} className="space-y-6">
        {track === "pregnancy" ? (
          <>
            {/* 3-Trimester Selector Grid */}
            <div
              role="radiogroup"
              aria-label={copy.trimesterGroupLabel}
              className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
            >
              {steps.map((step, index) => {
                const selected = index === trimester;
                return (
                  <button
                    key={step.id}
                    ref={(node) => {
                      trimesterRadio.refs.current[index] = node;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setTrimester(index)}
                    onKeyDown={trimesterRadio.onKeyDown}
                    className={cn(
                      "flex min-h-[60px] items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire",
                      selected
                        ? "border-foreground bg-surface-subtle text-foreground"
                        : "border-border bg-card text-foreground hover:border-foreground/30 hover:bg-surface-subtle/50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums",
                        selected ? "bg-foreground text-white" : "bg-surface-subtle text-muted-foreground",
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="block text-sm font-semibold leading-snug text-foreground">{step.name}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{step.weeks}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              role="img"
              aria-label={`${current.name}, ${current.weeks}. ${copy.whoContactTitle}: ${current.whoContact}`}
              className="flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-subtle/50 sm:h-44"
            >
              <LazyMotion features={domAnimation} strict>
                <WomensHealthScene step={trimester} playing={false} />
              </LazyMotion>
            </div>

            <div aria-live="polite" className="space-y-5 border-t border-border pt-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-base font-bold leading-snug text-foreground">{current.developmentTitle}</h4>
                <span className="text-xs font-medium text-muted-foreground">{current.weeks}</span>
              </div>

              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-semibold text-foreground">{copy.fetalDevelopmentTitle}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{current.developmentDesc}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-foreground">{copy.whoContactTitle}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{current.whoContact}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-foreground">{copy.clinicalChecklistTitle}</dt>
                  <dd>
                    <ul className="mt-1.5 space-y-1.5 text-sm">
                      {current.clinicalChecklist.map((item) => (
                        <li key={item} className="flex gap-2 text-muted-foreground">
                          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-sapphire" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-foreground">{copy.selfCarePrefix.replace(/:\s*$/, "")}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{current.selfCare}</dd>
                </div>
              </dl>

              {/* Hairline-divided warning signs — zero yellow alert box */}
              <div className="flex items-start gap-2.5 border-t border-border pt-4">
                <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">{copy.redFlagsPrefix} </span>
                  {current.redFlags}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              role="radiogroup"
              aria-label={copy.checkGroupLabel}
              className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
            >
              {[breast, cervical].map((check, index) => {
                const selected = check.id === checkId;
                return (
                  <button
                    key={check.id}
                    ref={(node) => {
                      checkRadio.refs.current[index] = node;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setCheckId(check.id)}
                    onKeyDown={checkRadio.onKeyDown}
                    className={cn(
                      "flex min-h-[52px] items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire",
                      selected
                        ? "border-foreground bg-surface-subtle text-foreground"
                        : "border-border bg-card text-foreground hover:border-foreground/30 hover:bg-surface-subtle/50",
                    )}
                  >
                    <span>{check.title}</span>
                  </button>
                );
              })}
            </div>

            {checkId === "breast-awareness" ? (
              <div className="space-y-5 border-t border-border pt-5">
                <p className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground sm:text-base">{breast.summary}</p>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{copy.breastAwarenessRule3Title}</h4>
                  <ol className="mt-2 divide-y divide-border border-y border-border">
                    {breast.rule3Steps.map((step, index) => (
                      <li key={step.stepName} className="flex gap-3 py-3 text-sm">
                        <span className="w-5 shrink-0 font-semibold tabular-nums text-muted-foreground">
                          {index + 1}
                        </span>
                        <p className="leading-relaxed">
                          <span className="font-semibold text-foreground">{step.stepName}. </span>
                          <span className="text-muted-foreground">{step.desc}</span>
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{copy.ageGuidanceTitle}</h4>
                  <dl className="mt-2 grid gap-x-6 gap-y-2 text-sm leading-relaxed sm:grid-cols-[max-content_minmax(0,1fr)]">
                    {breast.ageGuidance.map((item) => (
                      <div key={item.ageRange} className="contents">
                        <dt className="font-semibold text-foreground">{item.ageRange}</dt>
                        <dd className="text-muted-foreground">{item.guidance}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            ) : (
              <div className="space-y-5 border-t border-border pt-5">
                <div>
                  <p className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground sm:text-base">{cervical.summary}</p>
                  <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
                    {cervical.examExplanation}
                  </p>
                </div>
                <dl className="grid grid-cols-1 gap-6 border-t border-border pt-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-semibold text-foreground">{copy.nationalProgramPrefix.replace(/:\s*$/, "")}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{cervical.nationalProgramNote}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-semibold text-foreground">{copy.hpvVaccinationPrefix.replace(/:\s*$/, "")}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{cervical.vaccinationNote}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-semibold text-foreground">{copy.recommendedIntervalsTitle}</dt>
                    <dd>
                      <ul className="mt-1.5 space-y-1.5 text-sm">
                        {cervical.recommendedIntervals.map((interval) => (
                          <li key={interval} className="flex gap-2 text-muted-foreground">
                            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-sapphire" aria-hidden="true" />
                            <span>{interval}</span>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </dl>

                {/* Hairline-divided consultation prompt — zero yellow alert box */}
                <div className="flex items-start gap-2.5 border-t border-border pt-4">
                  <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground">{copy.promptConsultationPrefix} </span>
                    {cervical.warningSigns}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Emergency: calm and clear */}
      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[60ch] text-sm leading-relaxed text-foreground">{copy.emergencyNote}</p>
        <a
          href="tel:112"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-primary/30 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:self-center print:hidden"
        >
          <PhoneIcon className="h-4 w-4" aria-hidden="true" />
          {copy.call112Label}
        </a>
      </div>

      <p className="text-xs leading-snug text-muted-foreground">{copy.credit}</p>
    </div>
  );
}
