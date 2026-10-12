import { describe, expect, it } from "vitest";
import { getTreatmentEntries, sortTreatments, treatmentStatus } from "@/lib/treatments";
import { validateTreatmentPlanInput } from "@/lib/validation";
import { mapPatientRow, type DBPatientRow } from "@/lib/data/patients";
import { normalizePatientFromApi } from "@/lib/api-normalizers";
import { stringifyJsonColumn } from "@/lib/json";
import type { TreatmentEntry } from "@/lib/types/patient";

const first: TreatmentEntry = {
  id: "first", title: "First course", start_date: "2026-10-01", end_date: "2026-10-07",
  diagnosis: "First diagnosis", medications: "First therapy",
  photos: [{ id: "photo-1", name: "Prescription", date: "2026-10-01", data_url: "data:image/png;base64,AAAA" }],
};
const second: TreatmentEntry = {
  id: "second", title: "Second course", start_date: "2026-10-05", end_date: "2026-10-12",
  care_instructions: "Second plan instructions",
};

describe("multiple treatment plans", () => {
  it("preserves a previous single plan and all its photos without inventing dates", () => {
    const legacy = { diagnosis: "Original diagnosis", goals: "Original goal", photos: first.photos };
    expect(getTreatmentEntries(legacy)).toEqual([{ ...legacy, id: "legacy-treatment", title: "" }]);
    expect(validateTreatmentPlanInput({ entries: [...getTreatmentEntries(legacy), second] }).ok).toBe(true);
  });

  it("retains original photo timestamps when saving a migrated plan", () => {
    const photos = [{ ...first.photos![0], date: "2026-10-01T14:25:30.000Z" }];
    const result = validateTreatmentPlanInput({ entries: getTreatmentEntries({ diagnosis: "Original", photos }) });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value?.entries?.[0].photos?.[0].date).toBe("2026-10-01T14:25:30.000Z");
  });

  it("does not create phantom plans or resurrect deleted legacy data", () => {
    expect(getTreatmentEntries(null)).toEqual([]);
    expect(getTreatmentEntries({})).toEqual([]);
    expect(getTreatmentEntries({ diagnosis: "Old", entries: [] })).toEqual([]);
  });

  it("accepts overlapping courses and same-day treatment", () => {
    expect(validateTreatmentPlanInput({ entries: [first, second] }).ok).toBe(true);
    expect(validateTreatmentPlanInput({ entries: [{ ...first, end_date: first.start_date }] }).ok).toBe(true);
  });

  it("keeps independent details and photos through database and API normalization", () => {
    const validated = validateTreatmentPlanInput({ entries: [first, second] });
    expect(validated.ok).toBe(true);
    if (!validated.ok) return;
    const stored = stringifyJsonColumn(validated.value);
    const row = {
      id: 7, full_name: "Test patient", phone: "123", email: "patient@example.com",
      created_at: new Date("2026-10-01T00:00:00Z"), treatment_plan: stored,
    } as DBPatientRow;
    const mapped = mapPatientRow(row);
    const normalized = normalizePatientFromApi(mapped);
    expect(getTreatmentEntries(normalized?.treatment_plan)).toEqual([first, second]);
  });

  it("sorts by start date without mutating saved order", () => {
    const entries = [first, second, ...getTreatmentEntries({ diagnosis: "Legacy" })];
    expect(sortTreatments(entries).map((entry) => entry.id)).toEqual(["second", "first", "legacy-treatment"]);
    expect(entries[0]).toBe(first);
  });

  it("uses inclusive start and end dates for status", () => {
    expect(treatmentStatus(first, "2026-09-30")).toBe("upcoming");
    expect(treatmentStatus(first, "2026-10-01")).toBe("active");
    expect(treatmentStatus(first, "2026-10-07")).toBe("active");
    expect(treatmentStatus(first, "2026-10-08")).toBe("ended");
    expect(treatmentStatus({ id: "legacy-treatment", title: "" }, "2026-10-08")).toBe("undated");
  });

  it.each([
    { ...first, start_date: "2026-02-30" },
    { ...first, end_date: "2026-09-30" },
    { ...first, start_date: undefined },
    { ...first, end_date: undefined },
    { ...first, title: " " },
    { ...first, photos: [{ ...first.photos![0], data_url: "data:text/plain;base64,AAAA" }] },
  ])("rejects invalid course metadata or photos: %j", (entry) => {
    expect(validateTreatmentPlanInput({ entries: [entry] }).ok).toBe(false);
  });

  it("rejects duplicate identifiers, malformed JSON and non-object plans", () => {
    expect(validateTreatmentPlanInput({ entries: [first, first] }).ok).toBe(false);
    expect(validateTreatmentPlanInput("{bad json").ok).toBe(false);
    expect(validateTreatmentPlanInput([]).ok).toBe(false);
  });

  it("accepts existing JSON input and persists deletion of every course", () => {
    expect(validateTreatmentPlanInput(JSON.stringify({ entries: [first, second] }))).toEqual({ ok: true, value: { entries: [first, second] } });
    expect(validateTreatmentPlanInput({ entries: [] })).toEqual({ ok: true, value: { entries: [] } });
  });
});
