import type { ComponentType } from "react";
import type { Lang } from "@/lib/i18n/translations";

/** The eight health-information topics. Every registry keyed by topic must cover all of them. */
export type TopicSlug =
  | "heart-health"
  | "diabetes"
  | "healthy-eating"
  | "physical-activity"
  | "mental-wellbeing"
  | "smoking"
  | "preventive-screening"
  | "womens-health";

export const TOPIC_SLUGS: readonly TopicSlug[] = [
  "heart-health",
  "diabetes",
  "healthy-eating",
  "physical-activity",
  "mental-wellbeing",
  "smoking",
  "preventive-screening",
  "womens-health",
];

export function isTopicSlug(value: string): value is TopicSlug {
  return (TOPIC_SLUGS as readonly string[]).includes(value);
}

/**
 * Props every explainer scene receives.
 *
 * Scenes are pure drawings: they hold no strings (labels and captions are DOM
 * text rendered by ExplainerStage) and read colours only from CSS variables.
 * When `playing` is false a scene must render a static key frame that still
 * explains the idea on its own (direction arrows instead of motion).
 */
export interface ExplainerSceneProps {
  step: number;
  playing: boolean;
  lang?: Lang;
}

export type ExplainerScene = ComponentType<ExplainerSceneProps>;

/** One localized step of an explainer. */
export interface ExplainerStep {
  id: string;
  caption: string;
  ariaLabel: string;
  /** How long this step stays on screen while playing a multi-step scene. */
  durationMs?: number;
}

export interface ExplainerContent {
  title: string;
  steps: ExplainerStep[];
}
