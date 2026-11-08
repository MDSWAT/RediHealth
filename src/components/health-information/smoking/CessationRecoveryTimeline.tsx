"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { LazyMotion, domAnimation } from "motion/react";
import type { Lang } from "@/lib/i18n/translations";
import { cn } from "@/lib/cn";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import { BreathingLungsScene } from "./BreathingLungsScene";
import { SMOKING_TIMELINE_COPY } from "./smoking-copy";

export interface CessationRecoveryTimelineProps {
  lang: Lang;
  className?: string;
}

const NAV_BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40";

/** What happens after the last cigarette: five time points, one calm lung diagram. */
export function CessationRecoveryTimeline({ lang, className = "" }: CessationRecoveryTimelineProps) {
  const copy = SMOKING_TIMELINE_COPY[lang] ?? SMOKING_TIMELINE_COPY.ro;
  const milestones = copy.milestones;
  const [activeStep, setActiveStep] = useState(0);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = milestones[activeStep];
  const last = milestones.length - 1;
  const titleId = useId();

  const select = (index: number, focus = false) => {
    const next = Math.min(Math.max(index, 0), last);
    setActiveStep(next);
    if (focus) optionRefs.current[next]?.focus();
  };

  const onOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      select(activeStep + 1, true);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      select(activeStep - 1, true);
    }
  };

  return (
    <section className={className} aria-labelledby={titleId} data-testid="cessation-recovery-timeline">
      <h3 id={titleId} className="text-xl font-semibold tracking-tight text-foreground text-balance">
        {copy.componentTitle}
      </h3>
      <p className="mt-1.5 max-w-[65ch] text-base leading-relaxed text-muted-foreground text-pretty">
        {copy.componentSubtitle}
      </p>

      <div
        role="img"
        aria-label={`${current.badge}: ${current.title}`}
        className="mt-5 flex h-48 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-background sm:h-56"
      >
        <LazyMotion features={domAnimation} strict>
          <BreathingLungsScene step={activeStep} playing />
        </LazyMotion>
      </div>

      <div className="mt-5">
        <div
          role="radiogroup"
          aria-label={copy.scrubberLabel}
          className="grid grid-cols-2 gap-2 sm:grid-cols-5"
        >
          {milestones.map((milestone, index) => {
            const selected = index === activeStep;
            return (
              <button
                key={milestone.id}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(index)}
                onKeyDown={onOptionKeyDown}
                className={cn(
                  "min-h-[44px] rounded-lg border px-3 py-2 text-xs font-semibold leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire",
                  selected
                    ? "border-foreground bg-surface-subtle text-foreground"
                    : "border-border bg-card text-foreground hover:border-foreground/30 hover:bg-surface-subtle/50",
                )}
              >
                {milestone.badge}
              </button>
            );
          })}
        </div>

        <div aria-live="polite" className="mt-5 space-y-4 border-t border-border pt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="text-base font-bold leading-snug text-foreground">{current.title}</h4>
            <span className="text-xs font-medium text-muted-foreground">{current.badge}</span>
          </div>
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold text-foreground">{copy.patientFeelHeading}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{current.patientFeel}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-foreground">{copy.clinicalMetricHeading}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{current.clinicalMetric}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {copy.stepOfTemplate.replace("{n}", String(activeStep + 1)).replace("{total}", String(milestones.length))}
          </span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => select(activeStep - 1)} disabled={activeStep === 0} className={NAV_BUTTON}>
              <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
              {copy.prevStepLabel}
            </button>
            <button type="button" onClick={() => select(activeStep + 1)} disabled={activeStep === last} className={NAV_BUTTON}>
              {copy.nextStepLabel}
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs leading-snug text-muted-foreground">{copy.credit}</p>
    </section>
  );
}
