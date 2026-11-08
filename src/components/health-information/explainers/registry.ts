import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import type { Lang } from "@/lib/i18n/translations";
import { isTopicSlug, type TopicSlug } from "./types";

// Code-split per-topic interactive visualizers so each guide page only loads its own module
const BloodPressureSimulator = dynamic(() =>
  import("../heart-health/BloodPressureSimulator").then((m) => m.BloodPressureSimulator)
);
const DiabetesInteractiveHub = dynamic(() =>
  import("../diabetes/DiabetesInteractiveHub").then((m) => m.DiabetesInteractiveHub)
);
const HealthyEatingInteractiveHub = dynamic(() =>
  import("../healthy-eating/HealthyEatingInteractiveHub").then((m) => m.HealthyEatingInteractiveHub)
);
const ActivityEveryMoveCountsModule = dynamic(() =>
  import("../physical-activity/ActivityEveryMoveCountsModule").then((m) => m.ActivityEveryMoveCountsModule)
);
const BreathingPacer = dynamic(() =>
  import("../mental-wellbeing/BreathingPacer").then((m) => m.BreathingPacer)
);
const SmokingInteractiveHub = dynamic(() =>
  import("../smoking/SmokingInteractiveHub").then((m) => m.SmokingInteractiveHub)
);
const PreventiveScreeningSelector = dynamic(() =>
  import("../preventive-screening/PreventiveScreeningSelector").then((m) => m.PreventiveScreeningSelector)
);
const WomensHealthInteractiveStepper = dynamic(() =>
  import("../womens-health/WomensHealthInteractiveStepper").then((m) => m.WomensHealthInteractiveStepper)
);

/**
 * Each topic shows its explainer once, in the page body. (A sidebar card that replayed the
 * same drawing on every topic page was removed: it only duplicated the main explainer.)
 */
export interface TopicExplainerEntry {
  /** The interactive explainer shown in the topic page body (it reuses the shared stage styles). */
  Custom: ComponentType<{ lang: Lang; className?: string }> | ComponentType<{ lang?: Lang; className?: string }>;
}

/** One entry per topic: the interactive explainer for the page body. */
export const TOPIC_EXPLAINERS: Record<TopicSlug, TopicExplainerEntry> = {
  "heart-health": {
    Custom: BloodPressureSimulator,
  },
  diabetes: {
    Custom: DiabetesInteractiveHub,
  },
  "healthy-eating": {
    Custom: HealthyEatingInteractiveHub,
  },
  "physical-activity": {
    Custom: ActivityEveryMoveCountsModule,
  },
  "mental-wellbeing": {
    Custom: BreathingPacer,
  },
  smoking: {
    Custom: SmokingInteractiveHub,
  },
  "preventive-screening": {
    Custom: PreventiveScreeningSelector,
  },
  "womens-health": {
    Custom: WomensHealthInteractiveStepper,
  },
};

/** Canonical registry export */
export const EXPLAINER_REGISTRY = TOPIC_EXPLAINERS;

export function getTopicExplainer(slug: string): TopicExplainerEntry | null {
  return isTopicSlug(slug) ? TOPIC_EXPLAINERS[slug] : null;
}
