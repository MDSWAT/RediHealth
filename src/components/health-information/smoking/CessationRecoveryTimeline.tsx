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

/** Step navigation, as on every explainer: Back is a quiet text button, Next is ink-filled. */
const BACK_BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire disabled:cursor-not-allowed disabled:text-muted-foreground/50 disabled:hover:bg-transparent";
const NEXT_BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground";

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

      {/* The five moments as one segmented control */}
      <div
        role="radiogroup"
        aria-label={copy.scrubberLabel}
        className="mt-5 grid grid-cols-5 divide-x divide-border overflow-hidden rounded-lg border border-border"
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
                "min-h-11 px-1.5 py-2 text-center text-xs font-semibold leading-snug transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire sm:text-sm",
                selected
                  ? "bg-foreground text-background"
                  : "bg-card text-muted-foreground hover:bg-surface-subtle/60 hover:text-foreground",
              )}
            >
              {milestone.badge}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:items-start sm:gap-8">
        {/* The lungs sit straight on the card, square, beside the milestone text */}
        <div
          role="img"
          aria-label={`${current.badge}: ${current.title}`}
          className="mx-auto aspect-square w-full max-w-[280px] sm:max-w-none"
        >
          <LazyMotion features={domAnimation} strict>
            <BreathingLungsScene step={activeStep} playing />
          </LazyMotion>
        </div>

        <div aria-live="polite" className="space-y-4">
          <div>
            <p className="text-sm font-medium tabular-nums text-muted-foreground">{current.badge}</p>
            <h4 className="mt-0.5 text-lg font-semibold leading-snug text-foreground text-balance">{current.title}</h4>
          </div>
          <dl className="divide-y divide-border border-t border-border">
            <div className="py-3">
              <dt className="text-sm font-semibold text-foreground">{copy.patientFeelHeading}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{current.patientFeel}</dd>
            </div>
            <div className="py-3">
              <dt className="text-sm font-semibold text-foreground">{copy.clinicalMetricHeading}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{current.clinicalMetric}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {copy.stepOfTemplate.replace("{n}", String(activeStep + 1)).replace("{total}", String(milestones.length))}
          </span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => select(activeStep - 1)} disabled={activeStep === 0} className={BACK_BUTTON}>
              <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
              {copy.prevStepLabel}
            </button>
            <button type="button" onClick={() => select(activeStep + 1)} disabled={activeStep === last} className={NEXT_BUTTON}>
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
