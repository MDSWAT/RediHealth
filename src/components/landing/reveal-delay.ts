const STEP_SECONDS = 0.06;
const MAX_SECONDS = 0.24;

/** Reveal delay in seconds for the item at `index` in a landing grid or list: 60ms apart, capped at 240ms. */
export function revealDelay(index: number): number {
  return Math.min(index * STEP_SECONDS, MAX_SECONDS);
}
