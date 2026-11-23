import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  worker: {
    country: "RO" as const,
    workerId: "7",
    workerName: "Dr. Ana",
    isAdmin: false,
    isSuperAdmin: false,
    role: "Doctor",
  },
  query: vi.fn(),
  logActivity: vi.fn(),
}));

vi.mock("@/lib/staff-access", () => ({
  requireStaff: async () => ({
    worker: mocks.worker,
    email: "doctor@example.com",
    name: "Dr. Ana",
  }),
}));

vi.mock("@/lib/database", () => ({
  isCountryConfigured: () => true,
  getCountryDatabase: () => ({ query: mocks.query }),
}));

vi.mock("@/lib/activity-log", () => ({
  logActivity: mocks.logActivity,
}));

import { GET, POST } from "./route";

describe("/api/meetings/[id]/publish-recommendation patient assignment check", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.worker = {
      country: "RO",
      workerId: "7",
      workerName: "Dr. Ana",
      isAdmin: false,
      isSuperAdmin: false,
      role: "Doctor",
    };
    mocks.query.mockResolvedValue([[]]);
    mocks.logActivity.mockResolvedValue(true);
  });

  it("enforces current patient assignment for non-admin staff on POST when m.patient_id IS NOT NULL", async () => {
    const res = await POST(
      new Request("https://redi.healthcare/api/meetings/55/publish-recommendation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          primaryDiagnosis: "Hypertension",
          actionSteps: ["Measure blood pressure daily"],
        }),
      }),
      { params: Promise.resolve({ id: "55" }) },
    );

    expect(res.status).toBe(404);
    const [sql, params] = mocks.query.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain("m.organizer_worker_id = ?");
    expect(sql).toContain("m.patient_id IS NULL OR (p.id IS NOT NULL AND (p.assigned_worker_id = ? OR jsonb_has_id(p.assigned_worker_ids, ?)))");
    expect(params).toEqual(["55", "7", "7", "7"]);
  });

  it("enforces current patient assignment for non-admin staff on GET", async () => {
    const res = await GET(
      new Request("https://redi.healthcare/api/meetings/55/publish-recommendation"),
      { params: Promise.resolve({ id: "55" }) },
    );

    expect(res.status).toBe(404);
    const [sql, params] = mocks.query.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain("m.patient_id IS NULL OR (p.id IS NOT NULL AND (p.assigned_worker_id = ? OR jsonb_has_id(p.assigned_worker_ids, ?)))");
    expect(params).toEqual(["55", "7", "7", "7"]);
  });

  it("allows admins to publish recommendations for any meeting in their country", async () => {
    mocks.worker.isAdmin = true;
    mocks.query
      .mockResolvedValueOnce([[{ patient_id: 19, full_name: "Ion Popescu" }]])
      .mockResolvedValueOnce([{ insertId: 101 }]);

    const res = await POST(
      new Request("https://redi.healthcare/api/meetings/55/publish-recommendation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          primaryDiagnosis: "Hypertension",
          actionSteps: ["Measure blood pressure daily"],
        }),
      }),
      { params: Promise.resolve({ id: "55" }) },
    );

    expect(res.status).toBe(200);
    expect(mocks.query.mock.calls[0][1]).toEqual(["55"]);
  });
});
