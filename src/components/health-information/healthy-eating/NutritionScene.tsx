"use client";

import { STROKE } from "../explainers/scenes/scene-utils";

/** Drawing size (7:5, the stage it fills in the plate explainer). */
const W = 280;
const H = 200;
const CX = 104;
const CY = 100;
const R = 76;
/** Fine line for this diagram (the shared STROKE is drawn at 2). */
const LINE = { ...STROKE, strokeWidth: 1.5 };

/** Sector order matches `step`: 0 vegetables, 1 whole grains, 2 protein, 3 water. */
const SECTORS = [
  {
    d: `M ${CX} ${CY - R} A ${R} ${R} 0 0 0 ${CX} ${CY + R} Z`,
    fill: "var(--color-live-sage-soft)",
    stroke: "var(--color-live-sage)",
    label: "50%",
    lx: CX - R * 0.46,
    ly: CY + 6,
  },
  {
    d: `M ${CX} ${CY - R} A ${R} ${R} 0 0 1 ${CX + R} ${CY} L ${CX} ${CY} Z`,
    fill: "var(--color-amber-care-soft)",
    stroke: "var(--color-amber-care)",
    label: "25%",
    lx: CX + R * 0.42,
    ly: CY - R * 0.3,
  },
  {
    d: `M ${CX + R} ${CY} A ${R} ${R} 0 0 1 ${CX} ${CY + R} L ${CX} ${CY} Z`,
    fill: "var(--color-sapphire-soft)",
    stroke: "var(--color-sapphire)",
    label: "25%",
    lx: CX + R * 0.42,
    ly: CY + R * 0.44,
  },
] as const;

/** Colour changes on selection fade on the shared calm tokens (CSS, so reduced motion needs no branch). */
const FADE = "fill-opacity var(--dur-base) var(--ease-out-calm), stroke-opacity var(--dur-base) var(--ease-out-calm), opacity var(--dur-base) var(--ease-out-calm)";

export interface NutritionSceneProps {
  /** Part to show in full colour: 0 vegetables, 1 whole grains, 2 protein, 3 water. */
  step: number;
  /** Which parts to show in full colour (the plate builder). Overrides `step`. */
  litParts?: readonly boolean[];
}

/**
 * Healthy-eating plate: split 50 / 25 / 25 (vegetables, whole grains, protein)
 * with a glass of water beside it. A still diagram: choosing a part only deepens
 * its colour, the others stay legible at a lighter tint.
 */
export function NutritionScene({ step, litParts }: NutritionSceneProps) {
  const lit = (i: number) => (litParts ? Boolean(litParts[i]) : step === i);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" fill="none" aria-hidden="true">
      {/* Plate rim and well */}
      <circle cx={CX} cy={CY} r={R + 14} fill="var(--color-card)" stroke="var(--color-border)" {...LINE} />
      <circle cx={CX} cy={CY} r={R + 5} stroke="var(--color-border)" {...LINE} />

      {SECTORS.map((s, i) => (
        <g key={s.label + i}>
          {/* Only the fill dims for parts that are not selected; the figure stays in full ink. */}
          <path
            d={s.d}
            fill={s.fill}
            fillOpacity={lit(i) ? 1 : 0.45}
            stroke={s.stroke}
            strokeOpacity={lit(i) ? 1 : 0.5}
            {...LINE}
            style={{ transition: FADE }}
          />
          <text
            x={s.lx}
            y={s.ly}
            textAnchor="middle"
            fill="var(--color-foreground)"
            fontSize="15"
            fontWeight="600"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {s.label}
          </text>
        </g>
      ))}

      {/* Glass of water beside the plate */}
      <g opacity={lit(3) ? 1 : 0.5} style={{ transition: FADE }}>
        <path d="M216 58 H262 L255.5 140 Q255 145 250 145 H228 Q223 145 222.5 140 Z" fill="var(--color-card)" stroke="var(--color-sapphire-light)" {...LINE} />
        <path d="M219.3 88 H258.7 L256 139.5 Q255.6 142 253 142 H225 Q222.4 142 222 139.5 Z" fill="var(--color-sapphire-soft)" />
        <path d="M219.3 88 H258.7" stroke="var(--color-sapphire-light)" {...LINE} />
      </g>
    </svg>
  );
}
