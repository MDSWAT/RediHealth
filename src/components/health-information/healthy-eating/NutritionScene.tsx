"use client";

import { m, useReducedMotion } from "motion/react";
import { DURATION, EASE_OUT } from "@/lib/motion/tokens";
import type { ExplainerSceneProps } from "../explainers/types";
import { STROKE } from "../explainers/scenes/scene-utils";

const CX = 140;
const CY = 90;
const R = 62;

/** Sector order matches `step`: 0 vegetables, 1 whole grains, 2 protein, 3 water. */
const SECTORS = [
  {
    d: `M ${CX} ${CY - R} A ${R} ${R} 0 0 0 ${CX} ${CY + R} Z`,
    fill: "var(--color-live-sage-soft)",
    stroke: "var(--color-live-sage)",
    label: "50%",
    lx: CX - 30,
    ly: CY + 5,
  },
  {
    d: `M ${CX} ${CY - R} A ${R} ${R} 0 0 1 ${CX + R} ${CY} L ${CX} ${CY} Z`,
    fill: "var(--color-amber-care-soft)",
    stroke: "var(--color-amber-care)",
    label: "25%",
    lx: CX + 26,
    ly: CY - 20,
  },
  {
    d: `M ${CX + R} ${CY} A ${R} ${R} 0 0 1 ${CX} ${CY + R} L ${CX} ${CY} Z`,
    fill: "var(--color-sapphire-soft)",
    stroke: "var(--color-sapphire)",
    label: "25%",
    lx: CX + 26,
    ly: CY + 30,
  },
] as const;

/**
 * Healthy-eating scene: a plate split 50 / 25 / 25 (vegetables, whole grains,
 * protein) with a glass of water beside it. `step` highlights one part. When the
 * 60-second card plays, the parts appear once, in order; nothing loops.
 */
export function NutritionScene({ step, playing }: ExplainerSceneProps) {
  const reduced = useReducedMotion() ?? false;
  const reveal = playing && !reduced;
  const dim = (i: number) => (step === i || playing ? 1 : 0.45);

  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" fill="none" aria-hidden="true">
      {/* Plate rim and well */}
      <circle cx={CX} cy={CY} r={R + 12} fill="var(--color-card)" stroke="var(--color-border)" {...STROKE} />
      <circle cx={CX} cy={CY} r={R + 4} stroke="var(--color-border)" {...STROKE} />

      <g key={reveal ? "reveal" : "still"}>
        {SECTORS.map((s, i) => (
          <m.g
            key={s.label + i}
            initial={reveal ? { opacity: 0 } : false}
            animate={{ opacity: dim(i) }}
            transition={{
              duration: reduced ? 0 : DURATION.slow,
              ease: EASE_OUT,
              delay: reveal ? 0.2 + i * 0.5 : 0,
            }}
          >
            <path d={s.d} fill={s.fill} stroke={s.stroke} {...STROKE} />
            <text
              x={s.lx}
              y={s.ly}
              textAnchor="middle"
              fill={s.stroke}
              fontSize="13"
              fontWeight="600"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {s.label}
            </text>
          </m.g>
        ))}

        {/* Glass of water beside the plate */}
        <m.g
          initial={reveal ? { opacity: 0 } : false}
          animate={{ opacity: step === 3 || playing ? 1 : 0.45 }}
          transition={{ duration: reduced ? 0 : DURATION.slow, ease: EASE_OUT, delay: reveal ? 1.7 : 0 }}
        >
          <path d="M246 62 H282 L277 122 Q276.6 126 272.6 126 H255.4 Q251.4 126 251 122 Z" fill="var(--color-card)" stroke="var(--color-sapphire-light)" {...STROKE} />
          <path d="M249.4 84 H278.6 L276.9 122 Q276.6 124 274.6 124 H253.4 Q251.4 124 251.1 122 Z" fill="var(--color-sapphire-soft)" />
          <path d="M249.4 84 H278.6" stroke="var(--color-sapphire-light)" {...STROKE} />
        </m.g>
      </g>
    </svg>
  );
}
