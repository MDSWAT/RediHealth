"use client";

import { m, useReducedMotion } from "motion/react";
import type { ExplainerSceneProps } from "../explainers/types";
import { DURATION, EASE_OUT } from "@/lib/motion/tokens";

/* A week as a small chart: seven day columns, Monday first. Each step adds a layer
   that looks different from the others:
   0 short breaks from sitting: a row of hour ticks across the waking day, every day;
   1 an easy walk: a pale bar, about 15 minutes, every day;
   2 a brisk walk: a dark bar stacked on top, about 30 minutes, on 5 days;
   3 strength exercises: a marker above the bars, on 2 days.
   Bar height is the minutes, read against the gridlines at 15 / 30 / 45 min.
   The geometry is exported so the DOM day row and minute labels line up with it. */
export const ACTIVITY_VIEWBOX = { width: 400, height: 150 } as const;
export const ACTIVITY_DAYS = 7;
export const ACTIVITY_COL_W = 42;
export const ACTIVITY_COL_GAP = 10;
/** Room on the left for the minute labels (DOM). */
export const ACTIVITY_LEFT = 38;

/** Hour ticks band: one tick per waking hour or so. */
const TICK_TOP = 4;
const TICK_H = 9;
const TICKS = 8;

/** Bar chart: minutes up from the baseline. */
export const ACTIVITY_BASELINE_Y = 142;
const UNITS_PER_MIN = 2.3;
export const ACTIVITY_GRID_MINUTES = [15, 30, 45] as const;
export const activityMinuteY = (min: number) => ACTIVITY_BASELINE_Y - min * UNITS_PER_MIN;

const EASY_MIN = 15;
const BRISK_MIN = 30;
const BAR_W = 22;
const BRISK_DAYS = [0, 1, 2, 3, 4];
const STRENGTH_DAYS = [1, 3];

const colX = (day: number) => ACTIVITY_LEFT + day * (ACTIVITY_COL_W + ACTIVITY_COL_GAP);
const barX = (day: number) => colX(day) + (ACTIVITY_COL_W - BAR_W) / 2;
const RIGHT = colX(ACTIVITY_DAYS - 1) + ACTIVITY_COL_W;

/** A small dumbbell: the strength marker, also drawn in the legend. */
export function StrengthMarkPath({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g stroke="var(--color-sapphire)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${cx - 6} ${cy} H${cx + 6}`} />
      <rect x={cx - 10} y={cy - 4.5} width="3.5" height="9" rx="1" fill="var(--color-card)" />
      <rect x={cx + 6.5} y={cy - 4.5} width="3.5" height="9" rx="1" fill="var(--color-card)" />
    </g>
  );
}

/**
 * Physical activity as a weekly chart. Pure drawing: day names, minute labels and
 * the legend are DOM text around it. Bars grow from the baseline (transform only);
 * ticks and markers fade in. Static, with every reached layer drawn, under reduced motion.
 */
export function PhysicalActivityScene({ step }: ExplainerSceneProps) {
  const reduceMotion = useReducedMotion();
  const active = Math.min(Math.max(step, 0), 3);
  const ease = reduceMotion ? { duration: 0 } : { duration: DURATION.slow, ease: EASE_OUT };
  const shown = (layer: number) => layer <= active;
  const easyTop = activityMinuteY(EASY_MIN);
  const briskTop = activityMinuteY(EASY_MIN + BRISK_MIN);
  // Bars grow up from the baseline.
  const grow = { transformBox: "fill-box" as const, originX: 0.5, originY: 1 };

  return (
    <svg
      viewBox={`0 0 ${ACTIVITY_VIEWBOX.width} ${ACTIVITY_VIEWBOX.height}`}
      className="h-full w-full"
      fill="none"
      aria-hidden="true"
    >
      {/* Minute gridlines and the baseline */}
      {ACTIVITY_GRID_MINUTES.map((min) => (
        <path
          key={min}
          d={`M${ACTIVITY_LEFT} ${activityMinuteY(min)} H${RIGHT}`}
          stroke="var(--color-border)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
      ))}
      <path d={`M${ACTIVITY_LEFT} ${ACTIVITY_BASELINE_Y} H${RIGHT}`} stroke="var(--color-mist)" strokeWidth="1" />

      {/* 0: hour ticks across each waking day, on a thin day line */}
      <m.g initial={false} animate={{ opacity: shown(0) ? 1 : 0 }} transition={ease}>
        {Array.from({ length: ACTIVITY_DAYS }, (_, day) => {
          const x0 = colX(day) + 3;
          const span = ACTIVITY_COL_W - 6;
          return (
            <g key={day} stroke="var(--color-sapphire)" strokeLinecap="round">
              <path d={`M${x0} ${TICK_TOP + TICK_H} H${x0 + span}`} strokeWidth="1" opacity="0.4" />
              {Array.from({ length: TICKS }, (_, i) => {
                const x = x0 + (span * i) / (TICKS - 1);
                return <path key={i} d={`M${x} ${TICK_TOP} V${TICK_TOP + TICK_H}`} strokeWidth="1.5" />;
              })}
            </g>
          );
        })}
      </m.g>

      {/* 1: an easy walk, every day */}
      {Array.from({ length: ACTIVITY_DAYS }, (_, day) => (
        <m.rect
          key={`easy-${day}`}
          x={barX(day)}
          y={easyTop}
          width={BAR_W}
          height={ACTIVITY_BASELINE_Y - easyTop}
          rx="2"
          fill="var(--color-sapphire-border)"
          style={grow}
          initial={false}
          animate={{ scaleY: shown(1) ? 1 : 0, opacity: shown(1) ? 1 : 0 }}
          transition={ease}
        />
      ))}

      {/* 2: a brisk walk on top, 5 days */}
      {BRISK_DAYS.map((day) => (
        <m.rect
          key={`brisk-${day}`}
          x={barX(day)}
          y={briskTop}
          width={BAR_W}
          height={easyTop - briskTop - 1.5}
          rx="2"
          fill="var(--color-sapphire)"
          style={grow}
          initial={false}
          animate={{ scaleY: shown(2) ? 1 : 0, opacity: shown(2) ? 1 : 0 }}
          transition={ease}
        />
      ))}

      {/* 3: strength exercises, 2 days, marked above the bars */}
      <m.g initial={false} animate={{ opacity: shown(3) ? 1 : 0 }} transition={ease}>
        {STRENGTH_DAYS.map((day) => (
          <StrengthMarkPath key={day} cx={colX(day) + ACTIVITY_COL_W / 2} cy={briskTop - 12} />
        ))}
      </m.g>
    </svg>
  );
}
