import type { TreatmentEntry, TreatmentPlan } from "@/lib/types/patient";

export function getTreatmentEntries(plan?: TreatmentPlan | null): TreatmentEntry[] {
  if (!plan) return [];
  if (plan.entries) return plan.entries;
  if (!plan.diagnosis && !plan.goals && !plan.medications && !plan.care_instructions && !plan.photos?.length) {
    return [];
  }
  return [{ ...plan, id: "legacy-treatment", title: "" }];
}

export function sortTreatments(entries: TreatmentEntry[]): TreatmentEntry[] {
  return [...entries].sort((a, b) => (b.start_date || "").localeCompare(a.start_date || ""));
}

export function treatmentStatus(entry: TreatmentEntry, today: string): "upcoming" | "active" | "ended" | "undated" {
  if (!entry.start_date) return "undated";
  if (entry.start_date > today) return "upcoming";
  if (entry.end_date && entry.end_date < today) return "ended";
  return "active";
}

