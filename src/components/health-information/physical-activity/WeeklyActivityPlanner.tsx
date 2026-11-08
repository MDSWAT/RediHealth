"use client";

import { useId, useState } from "react";
import type { Lang } from "@/lib/i18n/translations";
import { ACTIVITY_COPY, getActivityBandId } from "./activity-copy";

export interface WeeklyActivityPlannerProps {
  lang: Lang;
  className?: string;
  initialMinutes?: number;
  initialDays?: number;
}

const MAX_MINUTES_PER_DAY = 60;
const MAX_DAYS = 7;
const SCALE_MAX = MAX_MINUTES_PER_DAY * MAX_DAYS;
const TARGET_LOW = 150;
const TARGET_HIGH = 300;
const pct = (minutes: number) => `${(minutes / SCALE_MAX) * 100}%`;

/**
 * "How much is enough": minutes a day × days a week, shown on a plain linear scale with the
 * WHO 150–300 minute band. Replaces the old multicolour progress ring.
 */
export function WeeklyActivityPlanner({
  lang,
  className = "",
  initialMinutes = 30,
  initialDays = 5,
}: WeeklyActivityPlannerProps) {
  const copy = (ACTIVITY_COPY[lang] ?? ACTIVITY_COPY.ro).planner;
  const id = useId();
  const [minutes, setMinutes] = useState(initialMinutes);
  const [days, setDays] = useState(initialDays);

  const weekly = minutes * days;
  const bandId = getActivityBandId(weekly);
  const band = copy.bands.find((b) => b.id === bandId) ?? copy.bands[0];
  const weeklyText = copy.weeklyTotalTemplate.replace("{minutes}", String(weekly));

  return (
    <div className={className} data-testid="weekly-activity-planner">
      <p className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground sm:text-base">{copy.targetNote}</p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor={`${id}-minutes`} className="text-sm font-semibold text-foreground">
              {copy.minutesLabel}
            </label>
            <span className="text-base font-bold tabular-nums text-foreground" aria-hidden="true">
              {minutes}
            </span>
          </div>
          <input
            id={`${id}-minutes`}
            type="range"
            min={0}
            max={MAX_MINUTES_PER_DAY}
            step={5}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="mt-2 h-11 w-full cursor-pointer accent-foreground"
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor={`${id}-days`} className="text-sm font-semibold text-foreground">
              {copy.daysLabel}
            </label>
            <span className="text-base font-bold tabular-nums text-foreground" aria-hidden="true">
              {days}
            </span>
          </div>
          <input
            id={`${id}-days`}
            type="range"
            min={0}
            max={MAX_DAYS}
            step={1}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="mt-2 h-11 w-full cursor-pointer accent-foreground"
          />
        </div>
      </div>

      <div className="mt-6 space-y-5 border-t border-border pt-5" aria-live="polite">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-xl font-bold tracking-tight text-foreground tabular-nums">{weeklyText}</p>
          <span className="text-xs font-medium text-muted-foreground">{copy.rangeLabel}</span>
        </div>

        {/* Linear scale 0–420 min with the WHO band */}
        <div className="relative" aria-hidden="true">
          <div className="relative h-2.5 overflow-hidden rounded-sm bg-surface-subtle">
            <div
              className="absolute inset-y-0 bg-sapphire-border/70"
              style={{ left: pct(TARGET_LOW), width: pct(TARGET_HIGH - TARGET_LOW) }}
            />
            <div
              className="absolute inset-0 origin-left bg-sapphire transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none"
              style={{ transform: `scaleX(${Math.min(weekly, SCALE_MAX) / SCALE_MAX})` }}
            />
            {[TARGET_LOW, TARGET_HIGH].map((mark) => (
              <div key={mark} className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-card" style={{ left: pct(mark) }} />
            ))}
          </div>
          <div className="relative mt-1.5 h-4 text-xs tabular-nums text-muted-foreground">
            <span className="absolute left-0">0</span>
            <span className="absolute -translate-x-1/2" style={{ left: pct(TARGET_LOW) }}>
              {TARGET_LOW}
            </span>
            <span className="absolute -translate-x-1/2" style={{ left: pct(TARGET_HIGH) }}>
              {TARGET_HIGH}
            </span>
            <span className="absolute right-0">{SCALE_MAX}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 border-t border-border pt-5 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-foreground">{band.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {band.description}
            </p>
          </div>
          <div>
            <p className="text-sm leading-relaxed text-muted-foreground">{copy.strengthNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
