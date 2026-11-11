/** Clockwise from the top, matching the brand artwork. */
export const WHEEL_ORDER = [
  "healthy-eating",
  "physical-activity",
  "mental-wellbeing",
  "smoking",
  "preventive-screening",
  "womens-health",
  "heart-health",
  "diabetes",
];

/** Screen angle (clockwise from the top) where the passing button lights up. */
export const HIGHLIGHT_ANGLE = 315;

/**
 * Index in WHEEL_ORDER of the button that is lit when the outer ring is `progress` (0 to 1)
 * of the way through one turn.
 */
export function litTopicIndex(progress: number, count: number = WHEEL_ORDER.length): number {
  const step = 360 / count;
  const degrees = (((HIGHLIGHT_ANGLE - progress * 360) % 360) + 360) % 360;
  return Math.round(degrees / step) % count;
}

/** How far through one turn (0 to 1) the outer ring is when the button at `index` is lit. */
export function litProgress(index: number, count: number = WHEEL_ORDER.length): number {
  return ((((HIGHLIGHT_ANGLE - (index * 360) / count) % 360) + 360) % 360) / 360;
}
