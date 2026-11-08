"use client";

import { m, useReducedMotion } from "motion/react";
import type { ExplainerSceneProps } from "../explainers/types";
import { DURATION, EASE_OUT } from "@/lib/motion/tokens";

const START_X = 20;
const END_X = 300;
const TRACK_Y = 104;
const TRACK_H = 14;
const weekX = (week: number) => START_X + (week / 40) * (END_X - START_X);

/** Trimesters in weeks: 1–12, 13–27, 28–40. */
const TRIMESTERS = [
  { from: 0, to: 12 },
  { from: 12, to: 27 },
  { from: 27, to: 40 },
] as const;

/** WHO antenatal care model (2016): eight contacts, grouped by trimester. */
const CONTACTS = [
  { week: 10, trimester: 0 },
  { week: 20, trimester: 1 },
  { week: 26, trimester: 1 },
  { week: 30, trimester: 2 },
  { week: 34, trimester: 2 },
  { week: 36, trimester: 2 },
  { week: 38, trimester: 2 },
  { week: 40, trimester: 2 },
] as const;

/**
 * Pregnancy as a 40-week timeline: three trimester segments, with the eight WHO antenatal
 * contacts as short marks above them. The selected trimester and its visits fill in sapphire
 * with a short cross-fade. No loops, no figures.
 */
export function WomensHealthScene({ step }: ExplainerSceneProps) {
  const reduceMotion = useReducedMotion();
  const active = Math.min(Math.max(step, 0), TRIMESTERS.length - 1);
  const fade = reduceMotion ? { duration: 0 } : { duration: DURATION.slow, ease: EASE_OUT };
  const trackTop = TRACK_Y - TRACK_H / 2;

  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" fill="none" aria-hidden="true">
      {/* Week ticks every 4 weeks; longer ticks at the trimester boundaries */}
      {Array.from({ length: 11 }, (_, i) => i * 4).map((week) => (
        <path
          key={week}
          d={`M${weekX(week)} ${TRACK_Y + 14} V${TRACK_Y + 19}`}
          stroke="var(--color-muted-foreground)"
          strokeWidth="1"
          opacity="0.35"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {[0, 12, 27, 40].map((week) => (
        <path
          key={`b-${week}`}
          d={`M${weekX(week)} ${TRACK_Y + 14} V${TRACK_Y + 28}`}
          stroke="var(--color-muted-foreground)"
          strokeWidth="1.25"
          opacity="0.7"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* Trimester segments */}
      {TRIMESTERS.map((t, i) => {
        const x = weekX(t.from) + (i === 0 ? 0 : 2);
        const width = weekX(t.to) - weekX(t.from) - (i === 0 || i === TRIMESTERS.length - 1 ? 2 : 4);
        return (
          <g key={t.from}>
            <rect
              x={x}
              y={trackTop}
              width={width}
              height={TRACK_H}
              rx={TRACK_H / 2}
              fill="var(--color-sapphire-soft)"
              stroke="var(--color-sapphire-border)"
              strokeWidth="1"
            />
            <m.rect
              x={x}
              y={trackTop}
              width={width}
              height={TRACK_H}
              rx={TRACK_H / 2}
              fill="var(--color-sapphire)"
              initial={false}
              animate={{ opacity: i === active ? 1 : 0 }}
              transition={fade}
            />
          </g>
        );
      })}

      {/* Antenatal contacts: one short mark per visit */}
      {CONTACTS.map((c) => {
        const x = weekX(c.week) - 2;
        return (
          <g key={c.week}>
            <rect x={x} y="56" width="4" height="26" rx="2" fill="var(--color-sapphire-border)" />
            <m.rect
              x={x}
              y="56"
              width="4"
              height="26"
              rx="2"
              fill="var(--color-sapphire)"
              initial={false}
              animate={{ opacity: c.trimester === active ? 1 : 0 }}
              transition={fade}
            />
          </g>
        );
      })}
    </svg>
  );
}
