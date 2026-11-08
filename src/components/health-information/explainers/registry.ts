import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import type { Lang } from "@/lib/i18n/translations";
import { isTopicSlug, type ExplainerScene, type TopicSlug } from "./types";

// Scenes
import { HeartPumpScene } from "./scenes/HeartPumpScene";
import { InsulinKeyScene } from "./scenes/InsulinKeyScene";
import { NutritionScene } from "../healthy-eating/NutritionScene";
import { PhysicalActivityScene } from "../physical-activity/PhysicalActivityScene";
import { BreathingPacerScene } from "./scenes/BreathingPacerScene";
import { BreathingLungsScene } from "../smoking/BreathingLungsScene";
import { PreventiveScreeningScene } from "../preventive-screening/PreventiveScreeningScene";
import { WomensHealthScene } from "../womens-health/WomensHealthScene";

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

export interface TopicExplainerEntry {
  /** Drawing used by the generic stage and inside the 60-second card. */
  Scene: ExplainerScene;
  /**
   * A fully interactive explainer that replaces the generic ExplainerStage on
   * the topic page (it must reuse the shared stage styles).
   */
  Custom?: ComponentType<{ lang: Lang; className?: string }> | ComponentType<{ lang?: Lang; className?: string }>;
  /** Attribution shown under the stage, when a scene adapts licensed artwork. */
  credit?: string;
}

/**
 * One entry per topic. Every single one of the eight topics has both a companion
 * 9:16 scene (for 60-second short media cards & stages) and a complete interactive visualizer.
 */
export const TOPIC_EXPLAINERS: Record<TopicSlug, TopicExplainerEntry> = {
  "heart-health": {
    Scene: HeartPumpScene,
    Custom: BloodPressureSimulator,
    credit: "Blood pressure categories from the ESC and SRC 2024 guidelines; home measurement steps from the European Society of Hypertension (ESH). Heart diagram drawn in-house.",
  },
  diabetes: {
    Scene: InsulinKeyScene,
    Custom: DiabetesInteractiveHub,
    credit: "Adapted from ADA 2024 Standards of Care and WHO Diabetes Factsheets",
  },
  "healthy-eating": {
    Scene: NutritionScene,
    Custom: HealthyEatingInteractiveHub,
    credit: "Adapted from Harvard T.H. Chan School of Public Health Healthy Eating Plate and WHO Salt Reduction Guidelines",
  },
  "physical-activity": {
    Scene: PhysicalActivityScene,
    Custom: ActivityEveryMoveCountsModule,
    credit: "Adapted from WHO Guidelines on Physical Activity and Sedentary Behaviour (Every Move Counts)",
  },
  "mental-wellbeing": {
    Scene: BreathingPacerScene,
    Custom: BreathingPacer,
    credit: "Adapted from Box Breathing and 4-7-8 Parasympathetic Autonomic Regulation Protocols",
  },
  smoking: {
    Scene: BreathingLungsScene,
    Custom: SmokingInteractiveHub,
    credit: "Adapted from WHO Tobacco Cessation Timelines and Clinical Craving Management Protocols",
  },
  "preventive-screening": {
    Scene: PreventiveScreeningScene,
    Custom: PreventiveScreeningSelector,
    credit: "Adapted from Romanian CNAS Pachet de Prevenție (HG 521/2023) and EU Council 2022 Cancer Screening Guidelines",
  },
  "womens-health": {
    Scene: WomensHealthScene,
    Custom: WomensHealthInteractiveStepper,
    credit: "Adapted from WHO Antenatal Care Guidelines and European Guidelines for Quality Assurance in Cervical and Breast Screening",
  },
};

/** Canonical registry export */
export const EXPLAINER_REGISTRY = TOPIC_EXPLAINERS;

export function getTopicExplainer(slug: string): TopicExplainerEntry | null {
  return isTopicSlug(slug) ? TOPIC_EXPLAINERS[slug] : null;
}
