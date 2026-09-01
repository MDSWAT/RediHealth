import { describe, expect, it } from "vitest";
import { mapPatientRow, type DBPatientRow } from "@/lib/data/patients";
import { parseJsonColumn, stringifyJsonColumn } from "@/lib/json";

function row(overrides: Record<string, unknown> = {}): DBPatientRow {
  return {
    id: 7,
    full_name: "Ada Lovelace",
    phone: "+40 700 000 000",
    email: "ada@example.com",
    created_at: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  } as DBPatientRow;
}

describe("parseJsonColumn", () => {
  it("parses a JSON string", () => {
    expect(parseJsonColumn<{ a: number }>('{"a":1}')).toEqual({ a: 1 });
  });

  it("passes through an already-parsed object", () => {
    const value = { a: 1 };
    expect(parseJsonColumn(value)).toBe(value);
  });

  it("returns null for empty or invalid input", () => {
    expect(parseJsonColumn(null)).toBeNull();
    expect(parseJsonColumn("")).toBeNull();
    expect(parseJsonColumn("{not json")).toBeNull();
  });
});

describe("stringifyJsonColumn", () => {
  it("serializes objects and leaves strings intact", () => {
    expect(stringifyJsonColumn({ a: 1 })).toBe('{"a":1}');
    expect(stringifyJsonColumn("already")).toBe("already");
    expect(stringifyJsonColumn(null)).toBeNull();
  });
});

describe("mapPatientRow", () => {
  it("normalizes ids, dates, and defaults", () => {
    const patient = mapPatientRow(row({ status: undefined, priority: undefined }));
    expect(patient.id).toBe("7");
    expect(patient.status).toBe("active");
    expect(patient.priority).toBe("moderate");
    expect(patient.created_at).toBe("2026-01-01T00:00:00.000Z");
    expect(patient.followups).toEqual([]);
    expect(patient.photos).toEqual([]);
    expect(patient.treatment_plan).toBeNull();
  });

  it("parses JSON columns and coerces foreign keys to strings", () => {
    const patient = mapPatientRow(
      row({
        assigned_worker_id: 3,
        followups: '[{"id":"1","title":"Check","date":"2026-02-01","status":"scheduled"}]',
        treatment_plan: '{"diagnosis":"stable"}',
      }),
    );
    expect(patient.assigned_worker_id).toBe("3");
    expect(patient.followups).toHaveLength(1);
    expect(patient.treatment_plan?.diagnosis).toBe("stable");
  });
});
