"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { LazyMotion, domAnimation } from "motion/react";
import type { Lang } from "@/lib/i18n/translations";
import { cn } from "@/lib/cn";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import {
  ACTIVITY_COL_GAP,
  ACTIVITY_COL_W,
  ACTIVITY_DAYS,
  ACTIVITY_GRID_MINUTES,
  ACTIVITY_LEFT,
  ACTIVITY_VIEWBOX,
  PhysicalActivityScene,
  StrengthMarkPath,
  activityMinuteY,
} from "./PhysicalActivityScene";
import { WeeklyActivityPlanner } from "./WeeklyActivityPlanner";
import { ACTIVITY_COPY } from "./activity-copy";

export interface ActivityEveryMoveCountsModuleProps {
  lang: Lang;
  className?: string;
  initialMode?: "stepper" | "ring";
}

type Mode = "stepper" | "ring";
const MODES: Mode[] = ["stepper", "ring"];

/** Step navigation, as on every explainer: Back is a quiet text button, Next is ink-filled. */
const BACK_BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:text-muted-foreground/50 disabled:hover:bg-transparent";
const NEXT_BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-foreground px-4 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground";

/** Day labels and minute labels share the chart's geometry, as percentages of its box. */
const pctX = (units: number) => `${(units / ACTIVITY_VIEWBOX.width) * 100}%`;
const pctY = (units: number) => `${(units / ACTIVITY_VIEWBOX.height) * 100}%`;
const CHART_RIGHT = ACTIVITY_LEFT + ACTIVITY_DAYS * ACTIVITY_COL_W + (ACTIVITY_DAYS - 1) * ACTIVITY_COL_GAP;
const DAY_ROW_STYLE = {
  paddingLeft: pctX(ACTIVITY_LEFT),
  paddingRight: pctX(ACTIVITY_VIEWBOX.width - CHART_RIGHT),
  columnGap: pctX(ACTIVITY_COL_GAP),
  gridTemplateColumns: `repeat(${ACTIVITY_DAYS}, minmax(0, 1fr))`,
} as const;
const MINUTE_LABEL = "absolute left-0 -translate-y-1/2 text-[11px] font-medium leading-none tabular-nums text-muted-foreground";

/** Legend swatches, drawn like the four layers of the chart. */
function LayerSwatch({ layer }: { layer: number }) {
  if (layer === 0) {
    return (
      <svg viewBox="0 0 16 12" className="h-3 w-4" fill="none" stroke="var(--color-sapphire)" strokeLinecap="round">
        <path d="M2 10.5 H14" strokeWidth="1" opacity="0.4" />
        <path d="M2 2 V10.5 M6 2 V10.5 M10 2 V10.5 M14 2 V10.5" strokeWidth="1.5" />
      </svg>
    );
  }
  if (layer === 3) {
    return (
      <svg viewBox="0 0 22 12" className="h-3 w-[22px]" fill="none">
        <StrengthMarkPath cx={11} cy={6} />
      </svg>
    );
  }
  return <span className={cn("block h-3 w-2.5 rounded-[2px]", layer === 1 ? "bg-sapphire-border" : "bg-sapphire")} />;
}

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

      <div
        role="tablist"
        aria-label={copy.tabsLabel}
        className="flex items-center gap-5 overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6"
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
                "-mb-px flex min-h-11 shrink-0 items-end gap-2 whitespace-nowrap border-b-2 px-1 pb-2.5 pt-2 text-left text-sm font-semibold leading-snug transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                selected
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
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
            <div
              role="radiogroup"
              aria-label={copy.stepper.groupLabel}
              className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-lg border border-border sm:grid-cols-4 sm:divide-x sm:divide-y-0"
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
                      "flex min-h-[60px] items-start gap-3 px-3.5 py-3 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                      selected ? "bg-surface-subtle text-foreground" : "bg-card text-foreground hover:bg-surface-subtle/50",
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

            {/* The week, filled in step by step. Day names and the legend are DOM text. */}
            <figure>
              <div role="img" aria-label={`${copy.stepper.weekCaption} ${stage.title}`}>
                <div className="relative w-full" style={{ aspectRatio: `${ACTIVITY_VIEWBOX.width} / ${ACTIVITY_VIEWBOX.height}` }}>
                  <LazyMotion features={domAnimation} strict>
                    <PhysicalActivityScene step={stageIdx} playing={false} lang={lang} />
                  </LazyMotion>
                  {/* Minute scale for the walking bars */}
                  <div aria-hidden="true">
                    <span className={MINUTE_LABEL} style={{ top: pctY(activityMinuteY(45) - 18) }}>
                      min
                    </span>
                    {ACTIVITY_GRID_MINUTES.map((min) => (
                      <span key={min} className={MINUTE_LABEL} style={{ top: pctY(activityMinuteY(min)) }}>
                        {min}
                      </span>
                    ))}
                  </div>
                </div>
                <div aria-hidden="true" className="mt-1.5 grid text-center text-xs font-semibold text-muted-foreground" style={DAY_ROW_STYLE}>
                  {copy.stepper.dayInitials.map((initial, day) => (
                    <span key={day}>{initial}</span>
                  ))}
                </div>
              </div>
              <figcaption className="mt-4 border-t border-border pt-3">
                <p className="text-xs text-muted-foreground">{copy.stepper.weekCaption}</p>
                <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                  {stages.map((s, layer) => (
                    <li
                      key={s.id}
                      className={cn(
                        "flex items-center gap-2.5 transition-opacity duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none",
                        layer > stageIdx ? "opacity-45" : "opacity-100",
                      )}
                    >
                      <span className="flex w-[22px] shrink-0 justify-center" aria-hidden="true">
                        <LayerSwatch layer={layer} />
                      </span>
                      <span className={layer === stageIdx ? "font-semibold text-foreground" : "text-foreground"}>
                        {s.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </figcaption>
            </figure>

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
                <button type="button" onClick={() => selectStage(stageIdx - 1)} disabled={stageIdx === 0} className={BACK_BUTTON}>
                  <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
                  {copy.stepper.prevButton}
                </button>
                <button type="button" onClick={() => selectStage(stageIdx + 1)} disabled={stageIdx === last} className={NEXT_BUTTON}>
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
