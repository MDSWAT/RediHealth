import * as React from "react";
import { getCalmMotionSnapshot, subscribeComfort } from "@/lib/comfort-preferences";

/**
 * Shared motion tokens for RediHealth.
 *
 * One calm, clinical motion language for the whole site:
 * - entrances decelerate (ease-out), loops breathe (ease-in-out), nothing bounces;
 * - no random values, no springs with overshoot, no infinite attention-seeking loops
 *   outside an explainer that the reader chose to look at;
 * - every animation must have a reduced-motion fallback (see useCalmReducedMotion).
 *
 * Mirrors the CSS custom properties `--ease-out-calm`, `--ease-in-out-calm`,
 * `--dur-fast`, `--dur-base`, `--dur-slow` in globals.css.
 */

/** Decelerating curve for entrances and state changes (easeOutQuart). */
export const EASE_OUT = [0.25, 1, 0.5, 1] as const;
/** Symmetric curve for continuous, physiological loops (breathing, heartbeat). */
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;
/** Accelerating curve, only for elements leaving the screen. */
export const EASE_IN = [0.5, 0, 0.75, 0] as const;

export const DURATION = {
  /** Hover / press feedback. */
  fast: 0.16,
  /** Most UI state changes. */
  base: 0.24,
  /** Panels, section entrances. */
  slow: 0.42,
} as const;

/** Tight UI list/control cadence in seconds (48ms). */
export const STAGGER_UI_S = 0.048;
/** Calm editorial cadence in seconds (84ms). */
export const STAGGER_EDITORIAL_S = 0.084;

/** Overdamped spring (zeta > 1) for Motion components: crisp settle, zero bounce. */
export const CLINICAL_SETTLE_SPRING = {
  type: "spring",
  stiffness: 300,
  damping: 34,
  mass: 0.9,
} as const;

/** Resting adult heart rate used by every heartbeat loop (bpm -> seconds per beat). */
export const RESTING_BPM = 64;
export const BEAT_SECONDS = 60 / RESTING_BPM;

/** Calm breathing cycle: 4 s in, 6 s out. */
export const BREATH_IN_SECONDS = 4;
export const BREATH_OUT_SECONDS = 6;

/** Small entrance offset in px. Anything larger reads as "flying in". */
export const ENTRANCE_OFFSET_PX = 8;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onStoreChange: () => void): () => void {
  const unsubComfort = subscribeComfort(onStoreChange);
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return unsubComfort;
  }
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => {
    unsubComfort();
    mql.removeEventListener("change", onStoreChange);
  };
}

function getReducedMotionSnapshot(): boolean {
  if (getCalmMotionSnapshot()) return true;
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

/**
 * SSR-safe reactive hook over `(prefers-reduced-motion: reduce)` and in-app Calm Motion.
 * Renders `false` on the server and syncs without tearing on the client.
 */
export function useCalmReducedMotion(): boolean {
  return React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}
