"use client";

import { useRef } from "react";
import { m, useInView, useReducedMotion } from "motion/react";
import { EASE_IN_OUT } from "@/lib/motion/tokens";
import type { ExplainerSceneProps } from "../types";
import { STROKE } from "./scene-utils";

/** One full "key opens the door" cycle in the 60-second card. */
const CYCLE_SECONDS = 7;

const RECEPTOR_X = 120;
const GATE_X = 210;
const KEY_START = { x: 58, y: 34 };
const KEY_DOCKED = { x: RECEPTOR_X, y: 68 };

/** Glucose in the blood that crosses the open gate, and where each one settles in the cell. */
const MOVING_GLUCOSE = [
  { from: [186, 42], to: [196, 140] },
  { from: [226, 54], to: [226, 148] },
  { from: [262, 40], to: [254, 136] },
] as const;
/** Glucose that stays in the blood, so the stream never looks empty. */
const RESTING_GLUCOSE = [[150, 54]] as const;

const GATE_Y = 101;

function hexagon(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

function Glucose({ cx, cy }: { cx: number; cy: number }) {
  return (
    <polygon
      points={hexagon(cx, cy, 6.5)}
      fill="var(--color-card)"
      stroke="var(--color-sapphire)"
      {...STROKE}
    />
  );
}

/** Insulin drawn as a small key (head + shaft + two teeth), centred on its head. */
function InsulinKey() {
  return (
    <g stroke="var(--color-amber-care)" {...STROKE}>
      <circle cx="0" cy="0" r="6" fill="var(--color-amber-care-soft)" />
      <path d="M0 6 V20 M0 13 H4 M0 17 H4" />
    </g>
  );
}

/**
 * Insulin as a key: it travels with the blood, fits the receptor on the cell,
 * the glucose gate (GLUT4) opens and glucose moves into the cell. The static
 * key frame (paused, or reduced motion) shows the end state: key docked, gate
 * open, glucose inside. The loop pauses off-screen.
 */
export function InsulinKeyScene({ playing }: ExplainerSceneProps) {
  const ref = useRef<SVGSVGElement | null>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const reduced = useReducedMotion() ?? false;
  const animating = playing && inView && !reduced;

  const cycle = (times: number[]) => ({
    duration: CYCLE_SECONDS,
    times,
    ease: EASE_IN_OUT,
    repeat: Infinity,
  });

  const keyDx = KEY_DOCKED.x - KEY_START.x;
  const keyDy = KEY_DOCKED.y - KEY_START.y;

  return (
    <svg ref={ref} viewBox="0 0 320 180" className="h-full w-full" fill="none" aria-hidden="true">
      {/* Bloodstream */}
      <rect x="16" y="18" width="288" height="60" rx="12" fill="var(--color-primary-soft)" stroke="var(--color-ruby-300)" {...STROKE} />

      {/* Cell interior */}
      <rect x="16" y="106" width="288" height="56" rx="12" fill="var(--color-sapphire-soft)" stroke="var(--color-sapphire-border)" {...STROKE} />

      {/* Cell membrane (two layers) */}
      <path d="M16 92 H304 M16 106 H304" stroke="var(--color-sapphire-light)" {...STROKE} />

      {/* Insulin receptor: a cup that the key fits into */}
      <path
        d={`M${RECEPTOR_X - 9} 80 V88 Q${RECEPTOR_X - 9} 92 ${RECEPTOR_X - 5} 92 H${RECEPTOR_X + 5} Q${RECEPTOR_X + 9} 92 ${RECEPTOR_X + 9} 88 V80 M${RECEPTOR_X} 92 V112`}
        stroke="var(--color-sapphire)"
        {...STROKE}
      />

      {/* GLUT4 gate: two halves that slide apart */}
      <m.rect
        x={GATE_X - 12}
        y="89"
        width="10"
        height="20"
        rx="3"
        fill="var(--color-live-sage-soft)"
        stroke="var(--color-live-sage)"
        {...STROKE}
        initial={false}
        animate={animating ? { x: [0, 0, -6, -6, 0, 0] } : { x: -6 }}
        transition={animating ? cycle([0, 0.28, 0.36, 0.86, 0.96, 1]) : { duration: 0 }}
      />
      <m.rect
        x={GATE_X + 2}
        y="89"
        width="10"
        height="20"
        rx="3"
        fill="var(--color-live-sage-soft)"
        stroke="var(--color-live-sage)"
        {...STROKE}
        initial={false}
        animate={animating ? { x: [0, 0, 6, 6, 0, 0] } : { x: 6 }}
        transition={animating ? cycle([0, 0.28, 0.36, 0.86, 0.96, 1]) : { duration: 0 }}
      />

      {RESTING_GLUCOSE.map(([cx, cy]) => (
        <Glucose key={`rest-${cx}`} cx={cx} cy={cy} />
      ))}

      {/* Glucose crossing through the open gate into the cell */}
      {MOVING_GLUCOSE.map(({ from, to }, i) => {
        const shift = i * 0.04;
        const gx = GATE_X - from[0];
        const gy = GATE_Y - from[1];
        const ex = to[0] - from[0];
        const ey = to[1] - from[1];
        return (
          <m.g
            key={`move-${from[0]}`}
            initial={false}
            animate={
              animating
                ? {
                    x: [0, 0, 0, gx, ex, ex, ex, 0],
                    y: [0, 0, 0, gy, ey, ey, ey, 0],
                    opacity: [0, 1, 1, 1, 1, 1, 0, 0],
                  }
                : { x: ex, y: ey, opacity: 1 }
            }
            transition={
              animating
                ? cycle([0, 0.06, 0.36 + shift, 0.5 + shift, 0.62 + shift, 0.86, 0.96, 1])
                : { duration: 0 }
            }
          >
            <Glucose cx={from[0]} cy={from[1]} />
          </m.g>
        );
      })}

      {/* Insulin key travelling to the receptor */}
      <m.g
        initial={false}
        animate={
          animating
            ? {
                x: [KEY_START.x, KEY_START.x, KEY_START.x + keyDx, KEY_START.x + keyDx, KEY_START.x + keyDx, KEY_START.x],
                y: [KEY_START.y, KEY_START.y, KEY_START.y + keyDy, KEY_START.y + keyDy, KEY_START.y + keyDy, KEY_START.y],
                opacity: [0, 1, 1, 1, 0, 0],
              }
            : { x: KEY_DOCKED.x, y: KEY_DOCKED.y, opacity: 1 }
        }
        transition={animating ? cycle([0, 0.06, 0.28, 0.86, 0.96, 1]) : { duration: 0 }}
      >
        <InsulinKey />
      </m.g>

      {/* Energy inside the cell: a mitochondrion */}
      <g stroke="var(--color-sapphire-light)" {...STROKE}>
        <rect x="56" y="124" width="40" height="22" rx="11" fill="var(--color-card)" />
        <path d="M62 135 Q66 129 70 135 T78 135 T86 135 T92 135" />
      </g>
    </svg>
  );
}
