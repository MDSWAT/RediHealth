import type { SubRegionId } from "@/components/health-check/anatomy-3d-data";
import type { BodyPartId, SymptomChoice } from "@/lib/i18n/health-check-translations";

/**
 * Exhaustive anatomical sub-region -> predicted symptom IDs mapping (all 46 SubRegionIds).
 * Ordered by clinical relevance for the chosen anatomical structure so selecting e.g. "neck"
 * predicts cervical/throat presentations rather than cranial headaches.
 */
export const PREDICTED_SYMPTOMS_BY_SUB_REGION: Record<SubRegionId, readonly string[]> = {
  // Head and neck (7)
  neck: ["head_neck_stiff", "head_throat_swallow", "head_neck_red_flag"],
  cervical_spine: ["head_neck_stiff", "head_neck_red_flag"],
  jaw_ear: ["head_jaw_ear", "head_throat_swallow", "head_fever", "head_sudden_severe"],
  cranium_occipital: [
    "head_tension",
    "head_neck_stiff",
    "head_migraine",
    "head_sudden_severe",
    "head_neck_red_flag",
  ],
  brain: ["head_migraine", "head_tension", "head_dehydration", "head_fever", "head_sudden_severe"],
  skull: ["head_tension", "head_migraine", "head_dehydration", "head_fever", "head_sudden_severe"],
  head_face: [
    "head_migraine",
    "head_tension",
    "head_jaw_ear",
    "head_fever",
    "head_dehydration",
    "head_sudden_severe",
  ],

  // Chest (6)
  breast: ["chest_breast_pain", "chest_breast_lump", "chest_warning"],
  axilla: ["chest_breast_lump", "chest_breast_pain", "chest_stitch", "chest_warning"],
  rib_cage: ["chest_stitch", "chest_exertion", "chest_reflux", "chest_warning"],
  pectoral: ["chest_stitch", "chest_exertion", "chest_warning"],
  heart: ["chest_exertion", "chest_reflux", "chest_warning"],
  lungs: ["chest_stitch", "chest_exertion", "chest_warning"],

  // Stomach and abdomen (5)
  stomach_organ: ["stomach_upper_reflux", "stomach_cramping_mild", "stomach_severe_widespread"],
  liver: ["stomach_upper_reflux", "stomach_cramping_mild", "stomach_severe_widespread"],
  colon: ["stomach_cramping_mild", "stomach_lower_sharp", "stomach_severe_widespread"],
  abdominals: [
    "stomach_cramping_mild",
    "stomach_upper_reflux",
    "stomach_lower_sharp",
    "stomach_severe_widespread",
  ],
  obliques: ["stomach_cramping_mild", "stomach_lower_sharp", "stomach_severe_widespread"],

  // Pelvis (4)
  uterus_ovaries: [
    "pelvis_period_cramps",
    "pelvis_one_sided",
    "pelvis_pressure_floor",
    "pelvis_pregnancy_bleeding",
  ],
  bladder: ["pelvis_urinary_burning", "pelvis_pressure_floor", "pelvis_pregnancy_bleeding"],
  pelvic_floor: ["pelvis_pressure_floor", "pelvis_urinary_burning", "pelvis_pregnancy_bleeding"],
  hip_groin: ["pelvis_one_sided", "pelvis_pressure_floor", "pelvis_pregnancy_bleeding"],

  // Back and spine (8)
  upper_back: ["back_upper_blades", "back_stiffness", "back_severe_difficulty"],
  trapezius: ["back_upper_blades", "back_stiffness", "back_severe_difficulty"],
  thoracic_spine: ["back_upper_blades", "back_stiffness", "back_flank_kidney", "back_severe_difficulty"],
  kidneys: ["back_flank_kidney", "back_chronic", "back_severe_difficulty"],
  lumbar_spine: ["back_strain_lift", "back_chronic", "back_stiffness", "back_severe_difficulty"],
  lower_back: ["back_strain_lift", "back_chronic", "back_stiffness", "back_severe_difficulty"],
  sacroiliac_coccyx: ["back_chronic", "back_stiffness", "back_strain_lift", "back_severe_difficulty"],
  gluteal: ["back_strain_lift", "back_chronic", "back_stiffness", "back_severe_difficulty"],

  // Arms and hands (9)
  deltoid: ["arm_shoulder_elbow", "arm_sprain", "arm_ache", "arm_sudden_swelling"],
  rotator_cuff: ["arm_shoulder_elbow", "arm_sprain", "arm_ache", "arm_sudden_swelling"],
  biceps: ["arm_ache", "arm_shoulder_elbow", "arm_sudden_swelling"],
  triceps: ["arm_ache", "arm_shoulder_elbow", "arm_sudden_swelling"],
  elbow_tendon: ["arm_shoulder_elbow", "arm_sprain", "arm_ache", "arm_sudden_swelling"],
  forearm_flexor: ["arm_ache", "arm_shoulder_elbow", "arm_numbness", "arm_sudden_swelling"],
  forearm_extensor: ["arm_shoulder_elbow", "arm_ache", "arm_numbness", "arm_sudden_swelling"],
  wrist_tendon: ["arm_sprain", "arm_numbness", "arm_sudden_swelling"],
  hands_fingers: ["arm_numbness", "arm_sprain", "arm_sudden_swelling"],

  // Legs and feet (7)
  hip_flexor: ["leg_hip_thigh", "leg_knee_ache", "leg_sudden_swelling"],
  quadriceps: ["leg_hip_thigh", "leg_knee_ache", "leg_sudden_swelling"],
  hamstrings: ["leg_hip_thigh", "leg_cramp", "leg_sudden_swelling"],
  patellar_tendon: ["leg_knee_ache", "leg_hip_thigh", "leg_sudden_swelling"],
  calves: ["leg_cramp", "leg_sudden_swelling"],
  achilles: ["leg_heel_foot", "leg_sprain", "leg_cramp", "leg_sudden_swelling"],
  feet_soles: ["leg_heel_foot", "leg_sprain", "leg_sudden_swelling"],
};

export interface PredictedSymptomPartition {
  /** Symptoms directly matching the selected sub-region (or all region symptoms when no sub-region is chosen). */
  primary: SymptomChoice[];
  /** Remaining symptoms in the macro region when narrowed by sub-region, available on explicit expand. */
  secondary: SymptomChoice[];
}

export function predictSymptomsForSelection(
  _part: BodyPartId | null,
  subRegion: SubRegionId | null | undefined,
  regionSymptoms: readonly SymptomChoice[],
  isRedFlagFn: (s: SymptomChoice) => boolean
): PredictedSymptomPartition {
  if (!regionSymptoms.length) {
    return { primary: [], secondary: [] };
  }

  if (!subRegion) {
    // Broad region selected without a specific sub-region: keep common options in natural order with red flags prominent.
    const sorted = [...regionSymptoms].sort(
      (a, b) => Number(isRedFlagFn(b)) - Number(isRedFlagFn(a))
    );
    return { primary: sorted, secondary: [] };
  }

  const predictedOrder = PREDICTED_SYMPTOMS_BY_SUB_REGION[subRegion];
  if (!predictedOrder || predictedOrder.length === 0) {
    return { primary: [...regionSymptoms], secondary: [] };
  }

  const orderIndex = new Map<string, number>();
  predictedOrder.forEach((id, idx) => orderIndex.set(id, idx));

  const primary: SymptomChoice[] = [];
  const secondary: SymptomChoice[] = [];

  for (const sym of regionSymptoms) {
    if (orderIndex.has(sym.id)) {
      primary.push(sym);
    } else {
      secondary.push(sym);
    }
  }

  primary.sort((a, b) => (orderIndex.get(a.id) ?? 999) - (orderIndex.get(b.id) ?? 999));

  if (primary.length === 0) {
    return { primary: [...regionSymptoms], secondary: [] };
  }

  return { primary, secondary };
}
