"use client";

import { m, useReducedMotion } from "motion/react";
import type { ExplainerSceneProps } from "../explainers/types";
import { DURATION, EASE_OUT } from "@/lib/motion/tokens";

const LINE = {
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

/* Time runs left to right; height is how far a silent change has progressed.
   The dashed horizontal line is the point where symptoms usually appear. */
const BASELINE_Y = 148;
const SYMPTOM_Y = 58;
const CHECK_X = 124;
const CHECK_Y = 136;
/** Points the DOM labels around the drawing are anchored to (viewBox units, 320 × 180). */
export const SCREENING_SCENE_GEOMETRY = {
  width: 320,
  height: 180,
  baselineY: BASELINE_Y,
  symptomY: SYMPTOM_Y,
  checkX: CHECK_X,
  plotRight: 290,
} as const;

/** Untreated course: slow and silent at first, then rising past the symptom line. */
const SILENT_PART = `M36 ${BASELINE_Y - 2} C70 ${BASELINE_Y - 3} 100 ${BASELINE_Y - 6} ${CHECK_X} ${CHECK_Y}`;
const UNTREATED_PART = `M${CHECK_X} ${CHECK_Y} C170 118 214 84 250 ${SYMPTOM_Y} C262 50 274 42 286 36`;
/** Course after an early check: treated, back down and flat. */
const TREATED_PART = `M${CHECK_X} ${CHECK_Y} C150 132 176 ${BASELINE_Y - 3} 286 ${BASELINE_Y - 3}`;

/**
 * How early detection works, as a calm line diagram (four steps). Pure drawing:
 * the selector places DOM labels ("symptoms appear", "found early" …) on top.
 * 0 you feel well while a change starts silently; 1 a short check;
 * 2 the change is found early, long before symptoms; 3 simpler treatment.
 */
export function PreventiveScreeningScene({ step, playing }: ExplainerSceneProps) {
  const reduceMotion = useReducedMotion();
  const phase = Math.min(Math.max(step, 0), 3);
  const fade = reduceMotion ? { duration: 0 } : { duration: DURATION.slow, ease: EASE_OUT };
  const draw = playing && !reduceMotion;

  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" fill="none" aria-hidden="true">
      {/* Axes */}
      <path d={`M36 ${BASELINE_Y} H290`} stroke="var(--color-border)" {...LINE} />
      <path d={`M36 ${BASELINE_Y} V28`} stroke="var(--color-border)" {...LINE} />

      {/* Where symptoms appear */}
      <path
        d={`M36 ${SYMPTOM_Y} H290`}
        stroke="var(--color-muted-foreground)"
        strokeDasharray="4 5"
        opacity="0.45"
        {...LINE}
        strokeWidth={1.25}
      />

      {/* Silent start (always visible) */}
      <m.path
        d={SILENT_PART}
        stroke="var(--color-sapphire)"
        initial={false}
        animate={{ pathLength: draw ? [0, 1] : 1 }}
        transition={draw ? { duration: DURATION.slow * 2, ease: EASE_OUT } : { duration: 0 }}
        {...LINE}
      />

      {/* Untreated course: solid until the change is found, then dashed and faded */}
      <m.path
        d={UNTREATED_PART}
        stroke="var(--color-muted-foreground)"
        initial={false}
        animate={{ opacity: phase >= 3 ? 0.25 : 0.6 }}
        transition={fade}
        strokeDasharray={phase >= 2 ? "3 5" : undefined}
        {...LINE}
      />

      {/* The check: a vertical marker at the moment of screening */}
      <m.g initial={false} animate={{ opacity: phase >= 1 ? 1 : 0 }} transition={fade}>
        <path d={`M${CHECK_X} ${BASELINE_Y} V30`} stroke="var(--color-sapphire)" opacity="0.35" {...LINE} strokeWidth={1.25} />
        <rect x={CHECK_X - 9} y="20" width="18" height="18" rx="5" fill="var(--color-card)" stroke="var(--color-sapphire)" strokeWidth="1.5" />
        <path d={`M${CHECK_X - 4} 29 L${CHECK_X - 1} 32 L${CHECK_X + 5} 25`} stroke="var(--color-sapphire)" {...LINE} strokeWidth={1.75} />
      </m.g>

      {/* Treated course */}
      <m.path
        d={TREATED_PART}
        stroke="var(--color-sapphire)"
        initial={false}
        animate={{ opacity: phase >= 3 ? 1 : 0, pathLength: phase >= 3 ? 1 : 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: DURATION.slow * 1.5, ease: EASE_OUT }}
        {...LINE}
        strokeWidth={2.5}
      />
      {/* Found early: a ring around the point on the curve */}
      <m.circle
        cx={CHECK_X}
        cy={CHECK_Y}
        r="7"
        fill="var(--color-card)"
        stroke="var(--color-sapphire)"
        strokeWidth="2"
        initial={false}
        animate={{ opacity: phase >= 2 ? 1 : 0 }}
        transition={fade}
      />
      <m.circle
        cx={CHECK_X}
        cy={CHECK_Y}
        r="3"
        fill="var(--color-sapphire)"
        initial={false}
        animate={{ opacity: phase >= 2 ? 1 : 0 }}
        transition={fade}
      />

    </svg>
  );
}
