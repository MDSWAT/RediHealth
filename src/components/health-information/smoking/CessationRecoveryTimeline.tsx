"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { LazyMotion, domAnimation } from "motion/react";
import type { Lang } from "@/lib/i18n/translations";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import { BreathingLungsScene } from "./BreathingLungsScene";
import { SMOKING_TIMELINE_COPY } from "./smoking-copy";

export interface CessationRecoveryTimelineProps {
  lang: Lang;
  className?: string;
}

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
      <h3 id={titleId} className="text-title font-semibold text-foreground text-balance">
        {copy.componentTitle}
      </h3>
      <p className="mt-1.5 max-w-(--measure-reading) text-body text-muted-foreground text-pretty">
        {copy.componentSubtitle}
      </p>

      {/* The five moments as one segmented control */}
      <div
        role="radiogroup"
        aria-label={copy.scrubberLabel}
        className="mt-5 flex flex-wrap gap-1.5 sm:grid sm:grid-cols-5 sm:gap-0 sm:divide-x sm:divide-border sm:overflow-hidden sm:rounded-lg sm:border sm:border-border"
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
                "min-h-11 flex-1 whitespace-nowrap rounded-lg border border-border px-2.5 py-2 text-center text-body font-semibold leading-snug transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:flex-none sm:rounded-none sm:border-0 sm:px-1.5",
                selected
                  ? "border-foreground bg-foreground text-background"
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
            <p className="text-body font-medium tabular-nums text-muted-foreground">{current.badge}</p>
            <h4 className="mt-0.5 text-title font-semibold leading-snug text-foreground text-balance">{current.title}</h4>
          </div>
          <dl className="divide-y divide-border border-t border-border">
            <div className="py-3">
              <dt className="text-meta font-semibold text-foreground">{copy.patientFeelHeading}</dt>
              <dd className="mt-1 text-meta text-muted-foreground">{current.patientFeel}</dd>
            </div>
            <div className="py-3">
              <dt className="text-meta font-semibold text-foreground">{copy.clinicalMetricHeading}</dt>
              <dd className="mt-1 text-meta text-muted-foreground">{current.clinicalMetric}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-meta font-medium tabular-nums text-muted-foreground">
            {copy.stepOfTemplate.replace("{n}", String(activeStep + 1)).replace("{total}", String(milestones.length))}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => select(activeStep - 1)}
              disabled={activeStep === 0}
              className="px-3 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeftIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {copy.prevStepLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => select(activeStep + 1)}
              disabled={activeStep === last}
            >
              {copy.nextStepLabel}
              <ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      <p className="mt-4 text-meta leading-snug text-muted-foreground">{copy.credit}</p>
    </section>
  );
}
