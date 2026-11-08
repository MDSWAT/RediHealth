"use client";

import { useRef } from "react";
import { m, useInView, useReducedMotion } from "motion/react";
import {
  BREATH_IN_SECONDS,
  BREATH_OUT_SECONDS,
  EASE_IN_OUT,
} from "@/lib/motion/tokens";
import type { ExplainerSceneProps } from "../types";
import { STROKE } from "./scene-utils";

export type BreathPhaseKind = "in" | "holdFull" | "out" | "holdEmpty";

export interface BreathPhase {
  kind: BreathPhaseKind;
  seconds: number;
}

export interface BreathingPacerSceneProps extends ExplainerSceneProps {
  /**
   * When given, the circle follows this phase (driven by BreathingPacer).
   * `seconds` is the time left in the phase, so the circle reaches its
   * target exactly when the phase ends.
   */
  phase?: BreathPhase;
  /** Keep the circle still and show the phase by colour only. */
  reducedMotion?: boolean;
}

/** Circle scale at the end of a breath out / a breath in. */
const EMPTY = 0.6;
const FULL = 1;
const CYCLE_SECONDS = BREATH_IN_SECONDS + BREATH_OUT_SECONDS;

function isFull(kind: BreathPhaseKind) {
  return kind === "in" || kind === "holdFull";
}

/**
 * One calm circle that grows while breathing in and shrinks while breathing out.
 * A single element animated with transform only, on the shared breathing tempo
 * (4 s in, 6 s out, EASE_IN_OUT). The self-running loop in the 60-second card
 * pauses off-screen and stops under prefers-reduced-motion.
 */
export function BreathingPacerScene({
  playing,
  phase,
  reducedMotion: reducedProp,
}: BreathingPacerSceneProps) {
  const ref = useRef<SVGSVGElement | null>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const prefersReduced = useReducedMotion() ?? false;
  const reducedMotion = reducedProp ?? prefersReduced;

  let animate: { scale: number | number[] };
  let transition: Record<string, unknown>;

  if (phase && !reducedMotion) {
    animate = { scale: isFull(phase.kind) ? FULL : EMPTY };
    transition = { duration: Math.max(0.2, phase.seconds), ease: EASE_IN_OUT };
  } else if (!phase && playing && inView && !reducedMotion) {
    animate = { scale: [EMPTY, FULL, EMPTY] };
    transition = {
      duration: CYCLE_SECONDS,
      times: [0, BREATH_IN_SECONDS / CYCLE_SECONDS, 1],
      ease: [EASE_IN_OUT, EASE_IN_OUT],
      repeat: Infinity,
    };
  } else {
    animate = { scale: phase ? (isFull(phase.kind) ? FULL : EMPTY) : EMPTY };
    transition = { duration: reducedMotion ? 0 : 0.6, ease: EASE_IN_OUT };
  }

  const tinted = phase ? isFull(phase.kind) : false;
  const showStaticGuide = !phase && !playing;

  return (
    <svg ref={ref} viewBox="0 0 320 180" className="h-full w-full" fill="none" aria-hidden="true">
      {/* Guide ring: how big a full breath gets */}
      <circle cx="160" cy="90" r="72" stroke="var(--color-sapphire-border)" strokeDasharray="2 6" {...STROKE} />

      <m.g
        data-breath-circle
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        initial={false}
        animate={animate}
        transition={transition}
      >
        <circle
          cx="160"
          cy="90"
          r="72"
          fill={tinted && reducedMotion ? "var(--color-sapphire-border)" : "var(--color-sapphire-soft)"}
          stroke="var(--color-sapphire)"
          {...STROKE}
        />
      </m.g>

      <circle cx="160" cy="90" r="3" fill="var(--color-sapphire)" />

      {/* Static key frame: short arrows from the resting circle out to the guide ring */}
      {showStaticGuide && (
        <g stroke="var(--color-sapphire-light)" {...STROKE}>
          <path d="M160 40 V26 M155 31 L160 26 L165 31" />
          <path d="M160 140 V154 M155 149 L160 154 L165 149" />
          <path d="M210 90 H224 M219 85 L224 90 L219 95" />
          <path d="M110 90 H96 M101 85 L96 90 L101 95" />
        </g>
      )}
    </svg>
  );
}
