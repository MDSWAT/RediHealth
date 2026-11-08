"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { LazyMotion, domAnimation } from "motion/react";
import type { Lang } from "@/lib/i18n/translations";
import { cn } from "@/lib/cn";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import { PhysicalActivityScene } from "./PhysicalActivityScene";
import { WeeklyActivityPlanner } from "./WeeklyActivityPlanner";
import { ACTIVITY_COPY } from "./activity-copy";

export interface ActivityEveryMoveCountsModuleProps {
  lang: Lang;
  className?: string;
  initialMode?: "stepper" | "ring";
}

type Mode = "stepper" | "ring";
const MODES: Mode[] = ["stepper", "ring"];

const NAV_BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire disabled:cursor-not-allowed disabled:opacity-40";

/** Physical activity explainer: four ways to move (progression diagram) and a weekly-minutes planner. */
export function ActivityEveryMoveCountsModule({
  lang,
  className = "",
  initialMode = "stepper",
}: ActivityEveryMoveCountsModuleProps) {
  const copy = ACTIVITY_COPY[lang] ?? ACTIVITY_COPY.ro;
  const id = useId();
  const [activeMode, setActiveMode] = useState<Mode>(initialMode);
  const [stageIdx, setStageIdx] = useState(0);
  const tabRefs = useRef<Record<Mode, HTMLButtonElement | null>>({ stepper: null, ring: null });
  const stageRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const stages = copy.stepper.stages;
  const stage = stages[stageIdx];
  const last = stages.length - 1;
  const labels: Record<Mode, string> = { stepper: copy.tabStepper, ring: copy.tabRing };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = MODES[(MODES.indexOf(activeMode) + 1) % MODES.length];
    setActiveMode(next);
    tabRefs.current[next]?.focus();
  };

  const selectStage = (index: number, focus = false) => {
    const next = Math.min(Math.max(index, 0), last);
    setStageIdx(next);
    if (focus) stageRefs.current[next]?.focus();
  };

  const onStageKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectStage(stageIdx + 1, true);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectStage(stageIdx - 1, true);
    }
  };

  return (
    <section
      className={cn("space-y-6 rounded-xl border border-border bg-card p-6 sm:p-8", className)}
      aria-labelledby={`${id}-title`}
      data-testid="activity-module"
    >
      <div>
        <h3 id={`${id}-title`} className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {copy.title}
        </h3>
        <p className="mt-1.5 max-w-[65ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
          {copy.subtitle}
        </p>
      </div>

      {/* Mode selector — clean 2-column grid matching DiabetesStepTutorialsModule */}
      <div
        role="tablist"
        aria-label={copy.tabsLabel}
        className="grid grid-cols-1 gap-2.5 border-t border-border pt-6 sm:grid-cols-2"
      >
        {MODES.map((mode) => {
          const selected = activeMode === mode;
          return (
            <button
              key={mode}
              ref={(node) => {
                tabRefs.current[mode] = node;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${mode}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveMode(mode)}
              onKeyDown={onTabKeyDown}
              className={cn(
                "flex min-h-[52px] items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire",
                selected
                  ? "border-foreground bg-surface-subtle text-foreground"
                  : "border-border bg-card text-foreground hover:border-foreground/30 hover:bg-surface-subtle/50",
              )}
            >
              <span>{labels[mode]}</span>
            </button>
          );
        })}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${activeMode}`} className="space-y-6">
        {activeMode === "stepper" ? (
          <>
            {/* 2x2 Step Selector Grid — matching HeartAnatomyPanel and InsulinMechanicsModule */}
            <div
              role="radiogroup"
              aria-label={copy.stepper.groupLabel}
              className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
            >
              {stages.map((s, index) => {
                const selected = index === stageIdx;
                return (
                  <button
                    key={s.id}
                    ref={(node) => {
                      stageRefs.current[index] = node;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => selectStage(index)}
                    onKeyDown={onStageKeyDown}
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
                      <span className="block text-sm font-semibold leading-snug text-foreground">
                        {s.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                        {s.timeBadge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Visual Stage */}
            <div
              role="img"
              aria-label={stage.title}
              className="flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-subtle/50 px-4 py-3 sm:h-52"
            >
              <LazyMotion features={domAnimation} strict>
                <PhysicalActivityScene step={stageIdx} playing={false} />
              </LazyMotion>
            </div>

            {/* Hairline-divided 2-column step breakdown */}
            <div aria-live="polite" className="space-y-4 border-t border-border pt-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-base font-bold leading-snug text-foreground">{stage.title}</h4>
                <span className="text-xs font-medium text-muted-foreground">{stage.timeBadge}</span>
              </div>
              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-semibold text-foreground">{copy.stepper.whyLabel}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{stage.physiology}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-foreground">{copy.stepper.practicalTipLabel}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{stage.action}</dd>
                </div>
              </dl>
            </div>

            {/* Footer navigation bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                {copy.stepper.stepOfTemplate.replace("{n}", String(stageIdx + 1)).replace("{total}", String(stages.length))}
              </span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => selectStage(stageIdx - 1)} disabled={stageIdx === 0} className={NAV_BUTTON}>
                  <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
                  {copy.stepper.prevButton}
                </button>
                <button type="button" onClick={() => selectStage(stageIdx + 1)} disabled={stageIdx === last} className={NAV_BUTTON}>
                  {copy.stepper.nextButton}
                  <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <WeeklyActivityPlanner lang={lang} />
        )}
      </div>

      {/* Calm, proportionate effort guidance + WHO source attribution */}
      <div className="space-y-2 border-t border-border pt-5">
        <p className="max-w-[70ch] text-sm leading-relaxed text-muted-foreground">{copy.safetyDisclaimer}</p>
        <p className="text-xs leading-snug text-muted-foreground">{copy.credit}</p>
      </div>
    </section>
  );
}
