import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  configured: vi.fn(() => true),
}));

vi.mock("@/lib/database", () => ({
  isCountryConfigured: mocks.configured,
  getCountryDatabase: () => ({ query: mocks.query }),
}));

import { canAccessMeeting } from "@/lib/record-access";

describe("canAccessMeeting patient-assignment scoping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.configured.mockReturnValue(true);
    mocks.query.mockResolvedValue([[]]);
  });

  it("requires current patient assignment when m.patient_id IS NOT NULL for non-admin staff", async () => {
    const allowed = await canAccessMeeting(
      { country: "RO", isAdmin: false, workerId: "7" },
      42,
    );
    expect(allowed).toBe(false);
    expect(mocks.query).toHaveBeenCalledTimes(1);
    const [sql, params] = mocks.query.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain("m.patient_id IS NULL AND m.organizer_worker_id = ?");
    expect(sql).toContain("p.id IS NOT NULL AND (p.assigned_worker_id = ? OR jsonb_has_id(p.assigned_worker_ids, ?))");
    expect(params).toEqual([42, "7", "7", "7"]);
  });

  it("allows admins to access any meeting in their country", async () => {
    mocks.query.mockResolvedValueOnce([[{ id: 42 }]]);
    const allowed = await canAccessMeeting(
      { country: "RO", isAdmin: true, workerId: "1" },
      42,
    );
    expect(allowed).toBe(true);
    expect(mocks.query).toHaveBeenCalledWith(
      "SELECT id FROM meetings WHERE id = ? LIMIT 1",
      [42],
    );
  });
});
