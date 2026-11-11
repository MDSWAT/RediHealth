import type {
  DurationId,
  SeverityId,
  SymptomChoice,
  UrgencyLevel,
} from "@/lib/i18n/health-check-translations";

// Acute surgical (appendicitis, peritonitis, ectopic pregnancy) and ischemic emergency presentations (DEF-18)
export const ACUTE_RED_FLAG_SYMPTOM_IDS = new Set<string>([
  "stomach_lower_sharp", // Acute appendicitis / peritoneal signs in right lower quadrant
  "stomach_severe_widespread", // Acute abdomen / peritonitis
  "pelvis_pregnancy_bleeding", // Ectopic pregnancy / acute gynecologic hemorrhage or infection
  "chest_warning", // Acute coronary syndrome / myocardial infarction
  "head_sudden_severe", // Thunderclap headache / intracranial emergency
  "head_neck_red_flag", // Meningeal stiffness with fever or confusion
  "back_severe_difficulty", // Cauda equina syndrome / severe neurovascular deficit
  "arm_sudden_swelling", // Sudden arm weakness: stroke until proven otherwise
  "leg_sudden_swelling", // Deep vein thrombosis / pulmonary embolism risk
]);

export function isAcuteSurgicalOrEmergency(symptom: Pick<SymptomChoice, "id" | "isRedFlag"> | null): boolean {
  if (!symptom) return false;
  return Boolean(symptom.isRedFlag || ACUTE_RED_FLAG_SYMPTOM_IDS.has(symptom.id));
}

/** Symptoms that need a doctor whatever the reported intensity (never "home care"). */
const MIN_CARE_BY_SYMPTOM: Record<string, UrgencyLevel> = {
  chest_exertion: "high", // possible angina: same-day assessment
  chest_stitch: "medium",
  chest_breast_lump: "medium", // new breast/underarm lump or skin change always warrants medical exam
  pelvis_one_sided: "medium", // unilateral pelvic pain warrants clinical/ultrasound evaluation
  pelvis_urinary_burning: "medium", // suspected UTI needs urinalysis / targeted care
  pelvis_pressure_floor: "medium", // pelvic floor prolapse / persistent dyspareunia warrants gynecological exam
  head_fever: "medium",
  head_jaw_ear: "medium", // possible otitis, dental infection, or TMJ pathology
  arm_numbness: "medium",
  back_chronic: "medium",
  back_flank_kidney: "high", // suspected pyelonephritis or renal colic: same-day medical evaluation
};

const CARE_RANK: Record<UrgencyLevel, number> = { low: 0, medium: 1, high: 2 };
const higher = (a: UrgencyLevel, b: UrgencyLevel) => (CARE_RANK[b] > CARE_RANK[a] ? b : a);

/**
 * Care level from the answers. Red-flag symptoms are handled separately as emergencies.
 * Every chosen symptom can raise the floor; a child is never sent to "home care" alone.
 */
export function getCareLevel(
  severity: SeverityId,
  duration: DurationId,
  symptomIds: string | string[] = [],
  forWhom: "self" | "child" = "self",
): UrgencyLevel {
  let level: UrgencyLevel = "low";
  if (severity === "severe") level = "high";
  else if (severity === "moderate" || duration === "weeks" || duration === "chronic") level = "medium";
  for (const id of Array.isArray(symptomIds) ? symptomIds : [symptomIds]) {
    const floor = MIN_CARE_BY_SYMPTOM[id];
    if (floor) level = higher(level, floor);
  }
  if (forWhom === "child") level = higher(level, "medium");
  return level;
}
