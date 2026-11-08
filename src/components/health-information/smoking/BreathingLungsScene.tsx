"use client";

import { useRef } from "react";
import { m, useInView, useReducedMotion } from "motion/react";
import type { ExplainerSceneProps } from "../explainers/types";
import {
  BREATH_IN_SECONDS,
  BREATH_OUT_SECONDS,
  DURATION,
  EASE_IN_OUT,
  EASE_OUT,
} from "@/lib/motion/tokens";

/** Recovery milestones drawn by this scene (20 min … 10 years). */
const LAST_STEP = 4;
const BREATH_CYCLE = BREATH_IN_SECONDS + BREATH_OUT_SECONDS;

/* Front view. The reader's left is the patient's right lung (three lobes);
   the reader's right is the patient's left lung, with the cardiac notch. */
const RIGHT_LUNG =
  "M148 66 C145 58 139 53 132 55 C113 61 97 88 92 118 C90 136 92 151 98 158 C112 153 130 151 146 156 C150 150 152 138 151 120 C150 102 151 82 148 66 Z";
const LEFT_LUNG =
  "M172 66 C175 58 181 53 188 55 C207 61 223 88 228 118 C230 136 228 151 222 158 C209 153 193 151 178 155 C173 151 169 145 171 139 C177 133 178 123 172 115 C170 99 170 82 172 66 Z";

/** One stroke weight for the whole drawing: outlines, airway and branches. */
const STROKE = {
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

/* One bronchial tree per lung, drawn as centrelines from the hilum: an upper, a middle
   and a lower branch, each with one side branch. The left tree mirrors the right one
   (x → 320 − x), and stays clear of the cardiac notch. Nothing crosses another line. */
const RIGHT_TREE =
  "M150 70 C146 76 142 80 138 84 " +
  "M138 84 C134 76 130 70 126 64 M130 72 C124 74 118 78 112 84 " +
  "M138 84 C128 90 118 98 108 106 " +
  "M138 84 C136 100 132 118 126 138 M134 108 C126 114 118 122 112 132";
const LEFT_TREE =
  "M170 70 C174 76 178 80 182 84 " +
  "M182 84 C186 76 190 70 194 64 M190 72 C196 74 202 78 208 84 " +
  "M182 84 C192 90 202 98 212 106 " +
  "M182 84 C184 100 188 118 194 138 M186 108 C194 114 202 122 208 132";

/**
 * Lungs after the last cigarette: a calm front-view diagram.
 * - While the reader plays it, the lungs breathe at 4 s in / 6 s out, only while on screen.
 * - Each recovery step clears a little of the grey residue from the lobes.
 * - Reduced motion or `playing = false`: a still, fully legible drawing.
 */
export function BreathingLungsScene({ step, playing }: ExplainerSceneProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduceMotion = useReducedMotion();
  const breathing = playing && inView && !reduceMotion;

  const progress = Math.min(Math.max(step, 0), LAST_STEP) / LAST_STEP;
  const residueOpacity = 0.6 * (1 - progress);

  // Cropped to the lungs (about 140 units wide in a 152-unit square) so the drawing fills its stage.
  return (
    <svg ref={ref} viewBox="84 12 152 152" className="h-full w-full" fill="none" aria-hidden="true">
      {/* Trachea: a plain tube that splits at the carina into the two main bronchi */}
      <path
        d="M156 18 V56 C156 60 153 64 148 69 M164 18 V56 C164 60 167 64 172 69 M152 73 C155 68 158 65 160 65 C162 65 165 68 168 73"
        stroke="var(--color-sapphire)"
        {...STROKE}
      />

      <m.g
        style={{ transformBox: "fill-box", transformOrigin: "50% 8%" }}
        initial={false}
        animate={breathing ? { scale: [1, 1.035, 1] } : { scale: 1 }}
        transition={
          breathing
            ? {
                duration: BREATH_CYCLE,
                times: [0, BREATH_IN_SECONDS / BREATH_CYCLE, 1],
                ease: [EASE_IN_OUT, EASE_IN_OUT],
                repeat: Infinity,
              }
            : { duration: DURATION.slow, ease: EASE_OUT }
        }
      >
        <path d={RIGHT_LUNG} fill="var(--color-sapphire-soft)" />
        <path d={LEFT_LUNG} fill="var(--color-sapphire-soft)" />

        {/* Residue that clears as the body recovers */}
        <m.g
          initial={false}
          animate={{ opacity: residueOpacity }}
          transition={{ duration: DURATION.slow, ease: EASE_OUT }}
        >
          <path d={RIGHT_LUNG} fill="var(--color-mist)" />
          <path d={LEFT_LUNG} fill="var(--color-mist)" />
        </m.g>

        {/* Outlines over the residue, so they keep the same weight as the airway */}
        <path d={RIGHT_LUNG} stroke="var(--color-sapphire)" {...STROKE} />
        <path d={LEFT_LUNG} stroke="var(--color-sapphire)" {...STROKE} />

        {/* Bronchial tree, one per lung */}
        <g stroke="var(--color-sapphire)" {...STROKE}>
          <path d={RIGHT_TREE} />
          <path d={LEFT_TREE} />
        </g>
      </m.g>
    </svg>
  );
}
