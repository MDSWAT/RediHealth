/** Shared drawing helpers so every scene uses the same stroke. Tempo comes from src/lib/motion/tokens.ts. */

export const STROKE = {
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};
