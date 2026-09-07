import { describe, expect, it } from "vitest";
import {
  normalizePatientFromApi,
  normalizePatientsFromApi,
  normalizeWorkerFromApi,
  normalizeWorkersFromApi,
} from "@/lib/api-normalizers";

describe("normalizePatientFromApi", () => {
  it("returns null for invalid payloads", () => {
    expect(normalizePatientFromApi(null)).toBeNull();
    expect(normalizePatientFromApi({})).toBeNull();
  });

  it("normalizes a valid API patient record", () => {
    const patient = normalizePatientFromApi({
      id: 5,
      full_name: "Ada Lovelace",
      phone: "+40 700 000 000",
      email: "ada@example.com",
      status: "inactive",
      priority: "high",
      followups: [{ id: "f1" }],
      photos: [{ id: "p1" }],
      created_at: "2026-01-01T00:00:00.000Z",
    });

    expect(patient).not.toBeNull();
    expect(patient?.id).toBe("5");
    expect(patient?.status).toBe("inactive");
    expect(patient?.priority).toBe("high");
    expect(patient?.followups).toHaveLength(1);
    expect(patient?.photos).toHaveLength(1);
  });
});

describe("normalizePatientsFromApi", () => {
  it("filters malformed entries and keeps valid ones", () => {
    const patients = normalizePatientsFromApi([
      { id: 1, full_name: "A", phone: "1", email: "a@example.com", created_at: "2026-01-01T00:00:00.000Z" },
      { id: null },
    ]);

    expect(patients).toHaveLength(1);
    expect(patients[0]?.id).toBe("1");
  });
});

describe("normalizeWorkerFromApi", () => {
  it("normalizes worker shape and defaults", () => {
    const worker = normalizeWorkerFromApi({
      id: 10,
      full_name: "Nurse Joy",
      email: "joy@example.com",
      assigned_patients_count: "3",
      created_at: "2026-01-01T00:00:00.000Z",
    });

    expect(worker).not.toBeNull();
    expect(worker?.id).toBe("10");
    expect(worker?.status).toBe("active");
    expect(worker?.assigned_patients_count).toBe(3);
  });
});

describe("normalizeWorkersFromApi", () => {
  it("returns an empty list for non-array inputs", () => {
    expect(normalizeWorkersFromApi(null)).toEqual([]);
  });
});
