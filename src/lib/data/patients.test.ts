import { describe, expect, it, vi } from "vitest";
import { loadPatients, mapPatientRow, type DBPatientRow } from "@/lib/data/patients";
import { parseJsonColumn, stringifyJsonColumn } from "@/lib/json";
import { encryptField } from "@/lib/security/field-encryption";

const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("@/lib/database", () => ({ getCountryDatabase: () => ({ query: mocks.query }) }));

describe("assignment patient loading", () => {
  it("omits clinical and binary columns while keeping assignment and search fields", async () => {
    mocks.query.mockResolvedValueOnce([[row({ assigned_worker_id: 3, assigned_worker_ids: '["3","4"]' })]]);
    const patients = await loadPatients({ country: "RO", projection: "assignment" });
    const sql = mocks.query.mock.calls.at(-1)![0];
    for (const column of ["intake", "photos", "profile_photo", "medical_history", "treatment_plan", "followups", "GROUP_CONCAT"]) {
      expect(sql).not.toContain(column);
    }
    for (const column of ["p.full_name", "p.phone", "p.email", "p.assigned_worker_ids"]) expect(sql).toContain(column);
    expect(patients[0].assigned_worker_ids).toEqual(["3", "4"]);
    expect(patients[0].medical_history).toBeNull();
    expect(patients[0].intake).toBeNull();
  });

  it("keeps the full projection as the default for clinical screens", async () => {
    mocks.query.mockResolvedValueOnce([[]]);
    await loadPatients({ country: "RO" });
    expect(mocks.query.mock.calls.at(-1)![0]).toContain("p.intake");
    expect(mocks.query.mock.calls.at(-1)![0]).toContain("p.medical_history");
  });
});

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
    const patient = mapPatientRow(row({ status: undefined, priority: undefined }), "RO");
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
      "RO",
    );
    expect(patient.assigned_worker_id).toBe("3");
    expect(patient.followups).toHaveLength(1);
    expect(patient.treatment_plan?.diagnosis).toBe("stable");
  });

  it("decrypts the encrypted fields with the country's own key", () => {
    vi.stubEnv("DATA_ENCRYPTION_KEY_RO", Buffer.alloc(32, 7).toString("base64"));
    try {
      const patient = mapPatientRow(
        row({
          medical_history: encryptField("RO", "Asthma since 2019"),
          profile_photo: encryptField("RO", "data:image/jpeg;base64,AAAA"),
          photos: encryptField("RO", '[{"id":"p1","name":"Rash","data_url":"data:image/png;base64,BBBB","date":"2026-01-01"}]'),
          intake: encryptField("RO", '{"has_documents":true,"documents":[],"location":{"latitude":0,"longitude":0,"accuracy":10}}'),
        }),
        "RO",
      );
      expect(patient.medical_history).toBe("Asthma since 2019");
      expect(patient.profile_photo).toBe("data:image/jpeg;base64,AAAA");
      expect(patient.photos?.[0]).toMatchObject({ id: "p1", name: "Rash" });
      expect(patient.intake).toEqual({ has_documents: true, documents: [], location: { latitude: 0, longitude: 0, accuracy: 10 } });
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
