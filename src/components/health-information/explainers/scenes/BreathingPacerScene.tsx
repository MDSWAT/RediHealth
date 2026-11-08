"use client";

import { m, useReducedMotion } from "motion/react";
import { EASE_IN_OUT } from "@/lib/motion/tokens";
import { STROKE } from "./scene-utils";

/** Fine line for the circle and its ring (the shared STROKE is drawn at 2). */
const LINE = { ...STROKE, strokeWidth: 1.5 };

export type BreathPhaseKind = "in" | "holdFull" | "out" | "holdEmpty";

export interface BreathPhase {
  kind: BreathPhaseKind;
  seconds: number;
}

export interface BreathingPacerSceneProps {
  /**
   * The phase BreathingPacer is in, or nothing while the pacer is stopped.
   * `seconds` is the time left in the phase, so the circle reaches its
   * target exactly when the phase ends (4 s in / 6 s out on the slow rhythm).
   */
  phase?: BreathPhase;
  /** Keep the circle still and show the phase by colour only. */
  reducedMotion?: boolean;
}

/** Circle scale at the end of a breath out / a breath in. */
const EMPTY = 0.6;
const FULL = 1;

function isFull(kind: BreathPhaseKind) {
  return kind === "in" || kind === "holdFull";
}

/**
 * One calm circle that grows while breathing in and shrinks while breathing out,
 * inside a faint ring that marks a full breath. Nothing else is drawn: the phase
 * word is DOM text placed over the circle by BreathingPacer. A single element
 * animated with transform only, timed by the pacer's phase clock with EASE_IN_OUT.
 * Nothing moves until the reader presses Start; under prefers-reduced-motion the
 * circle stays still and only its tint changes.
 */
export function BreathingPacerScene({ phase, reducedMotion: reducedProp }: BreathingPacerSceneProps) {
  const prefersReduced = useReducedMotion() ?? false;
  const reducedMotion = reducedProp ?? prefersReduced;

  let animate: { scale: number };
  let transition: Record<string, unknown>;

  if (reducedMotion) {
    animate = { scale: EMPTY };
    transition = { duration: 0 };
  } else if (phase) {
    animate = { scale: isFull(phase.kind) ? FULL : EMPTY };
    transition = { duration: Math.max(0.2, phase.seconds), ease: EASE_IN_OUT };
  } else {
    // Stopped: settle back to the resting size.
    animate = { scale: EMPTY };
    transition = { duration: 0.6, ease: EASE_IN_OUT };
  }

  const tinted = phase ? isFull(phase.kind) : false;

  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" fill="none" aria-hidden="true">
      {/* Faint ring: how big a full breath gets */}
      <circle cx="100" cy="100" r="84" stroke="var(--color-sapphire-border)" {...LINE} />

      <m.g
        data-breath-circle
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        initial={false}
        animate={animate}
        transition={transition}
      >
        <circle
          cx="100"
          cy="100"
          r="84"
          fill={tinted && reducedMotion ? "var(--color-sapphire-border)" : "var(--color-sapphire-soft)"}
          stroke="var(--color-sapphire)"
          {...LINE}
          style={{ transition: "fill var(--dur-slow) var(--ease-out-calm)" }}
        />
      </m.g>
    </svg>
  );
}
