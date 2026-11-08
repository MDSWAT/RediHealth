"use client";

import type { ExplainerSceneProps } from "../types";
import { HeartDiagram } from "./HeartDiagram";

/**
 * Heart-health scene for the explainer stage and the 60-second card: the heart
 * beating at a resting 64 bpm with its ECG trace. A pure drawing (no words);
 * when `playing` is false it shows the resting heart and the full trace.
 */
export function HeartPumpScene({ playing }: ExplainerSceneProps) {
  return <HeartDiagram playing={playing} className="mx-auto max-h-full" />;
}
