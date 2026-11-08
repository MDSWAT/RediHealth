"use client";

import { m, useReducedMotion } from "motion/react";
import type { ExplainerSceneProps } from "../explainers/types";
import { DURATION, EASE_OUT } from "@/lib/motion/tokens";

const STAGES = [
  { index: 0, cx: 56, barTop: 118, barHeight: 28, iconY: 84 },
  { index: 1, cx: 125, barTop: 98, barHeight: 48, iconY: 64 },
  { index: 2, cx: 195, barTop: 76, barHeight: 70, iconY: 42 },
  { index: 3, cx: 264, barTop: 54, barHeight: 92, iconY: 20 },
] as const;

const CURVE_PATH = "M 56 118 C 90 118, 92 98, 125 98 C 158 98, 162 76, 195 76 C 228 76, 232 54, 264 54";

function StageGlyph({ index, active }: { index: number; active: boolean }) {
  const stroke = active ? "var(--color-sapphire)" : "var(--color-muted-foreground)";
  if (index === 0) {
    // Upward posture / stand up
    return (
      <g stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 5 V-5" />
        <path d="M-4 -1 L0 -5 L4 -1" />
        <path d="M-5 7 H5" />
      </g>
    );
  }
  if (index === 1) {
    // Easy walking pace
    return (
      <g stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="0" cy="-5.5" r="2" />
        <path d="M0 -3 V2 L-3.5 6.5" />
        <path d="M0 1 L3.5 6.5" />
        <path d="M-3.5 -1 L3.5 0.5" />
      </g>
    );
  }
  if (index === 2) {
    // Brisk cardio pulse
    return (
      <g stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-7 0 H-3.5 L-1.5 -5 L1.5 5 L3.5 0 H7" />
      </g>
    );
  }
  // Strength and balance dumbbell
  return (
    <g stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-6 0 H6" />
      <rect x="-8" y="-4" width="2.5" height="8" rx="0.75" />
      <rect x="5.5" y="-4" width="2.5" height="8" rx="0.75" />
    </g>
  );
}

/**
 * Physical activity 4-stage progression diagram:
 * 1. Stand up every hour -> 2. Easy daily walk -> 3. Brisk cardio -> 4. Strength & balance.
 */
export function PhysicalActivityScene({ step, playing }: ExplainerSceneProps) {
  const reduceMotion = useReducedMotion();
  const active = Math.min(Math.max(step, 0), STAGES.length - 1);
  const transition = reduceMotion ? { duration: 0 } : { duration: DURATION.slow, ease: EASE_OUT };

  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" fill="none" aria-hidden="true">
      {/* Subtle horizontal grid lines */}
      <line x1="28" y1="54" x2="292" y2="54" stroke="var(--color-border)" strokeDasharray="3 3" strokeWidth="1" />
      <line x1="28" y1="100" x2="292" y2="100" stroke="var(--color-border)" strokeDasharray="3 3" strokeWidth="1" />
      <line x1="28" y1="146" x2="292" y2="146" stroke="var(--color-border)" strokeWidth="1.5" />

      {/* Connecting progression curve */}
      <m.path
        d={CURVE_PATH}
        stroke="var(--color-sapphire)"
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: playing && !reduceMotion ? [0, 1] : 1 }}
        transition={playing && !reduceMotion ? { duration: 1.2, ease: EASE_OUT } : { duration: 0 }}
      />

      {/* Four progression bars + icon badges + step numbers */}
      {STAGES.map((stage) => {
        const isReached = stage.index <= active;
        const isCurrent = stage.index === active;

        return (
          <g key={stage.index}>
            {/* Bar column */}
            <m.rect
              x={stage.cx - 18}
              y={stage.barTop}
              width="36"
              height={stage.barHeight}
              rx="5"
              initial={false}
              animate={{
                fill: isCurrent
                  ? "var(--color-sapphire)"
                  : isReached
                    ? "var(--color-sapphire-soft)"
                    : "var(--color-surface-subtle)",
                stroke: isCurrent
                  ? "var(--color-sapphire)"
                  : isReached
                    ? "var(--color-sapphire-border)"
                    : "var(--color-border)",
              }}
              transition={transition}
              strokeWidth="1.5"
            />

            {/* Top icon badge */}
            <g transform={`translate(${stage.cx}, ${stage.iconY})`}>
              <rect
                x="-14"
                y="-14"
                width="28"
                height="28"
                rx="6"
                fill="var(--color-card)"
                stroke={isCurrent ? "var(--color-sapphire)" : "var(--color-border)"}
                strokeWidth={isCurrent ? "2" : "1.25"}
              />
              <StageGlyph index={stage.index} active={isReached} />
            </g>

            {/* Step number along the baseline */}
            <text
              x={stage.cx}
              y="164"
              textAnchor="middle"
              fontSize="11"
              fontWeight={isCurrent ? "700" : "600"}
              fill={isCurrent ? "var(--color-foreground)" : "var(--color-muted-foreground)"}
            >
              {stage.index + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
