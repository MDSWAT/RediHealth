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

const OUTLINE = {
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};
const FINE = { ...OUTLINE, strokeWidth: 1 };

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

  return (
    <svg ref={ref} viewBox="0 0 320 180" className="h-full w-full" fill="none" aria-hidden="true">
      {/* Trachea with cartilage rings */}
      <path d="M160 20 V62" stroke="var(--color-sapphire)" {...OUTLINE} />
      {[28, 36, 44, 52].map((y) => (
        <path key={y} d={`M155 ${y} H165`} stroke="var(--color-sapphire)" opacity="0.35" {...FINE} />
      ))}

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
        <path d={RIGHT_LUNG} fill="var(--color-sapphire-soft)" stroke="var(--color-sapphire)" {...OUTLINE} />
        <path d={LEFT_LUNG} fill="var(--color-sapphire-soft)" stroke="var(--color-sapphire)" {...OUTLINE} />

        {/* Residue that clears as the body recovers */}
        <m.g
          initial={false}
          animate={{ opacity: residueOpacity }}
          transition={{ duration: DURATION.slow, ease: EASE_OUT }}
        >
          <path d={RIGHT_LUNG} fill="var(--color-mist)" />
          <path d={LEFT_LUNG} fill="var(--color-mist)" />
        </m.g>

        {/* Fissures between the lobes */}
        <g stroke="var(--color-sapphire)" opacity="0.4" {...FINE}>
          <path d="M147 92 C130 100 112 116 98 140" />
          <path d="M121 107 C112 109 103 112 95 116" />
          <path d="M173 90 C190 100 208 118 222 142" />
        </g>

        {/* Bronchial tree */}
        <g stroke="var(--color-sapphire)" opacity="0.75" {...FINE}>
          <path d="M160 62 C154 68 148 72 142 78 M142 78 C134 86 126 96 118 110 M142 78 C140 94 136 112 130 130 M126 96 C118 98 110 102 104 108" />
          <path d="M160 62 C166 68 172 72 178 78 M178 78 C186 86 194 96 202 110 M178 78 C180 92 184 108 190 124 M194 96 C202 98 210 102 216 108" />
        </g>
      </m.g>
    </svg>
  );
}
