import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  verifyRecaptcha: vi.fn(),
  findPatientByPortalToken: vi.fn(),
  getConnection: vi.fn(),
  query: vi.fn(),
  beginTransaction: vi.fn(),
  commit: vi.fn(),
  rollback: vi.fn(),
  release: vi.fn(),
  logActivity: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mocks.checkRateLimit,
  getClientIp: () => "127.0.0.1",
}));
vi.mock("@/lib/security/recaptcha", () => ({ verifyRecaptcha: mocks.verifyRecaptcha }));
vi.mock("@/lib/data/portal", () => ({ findPatientByPortalToken: mocks.findPatientByPortalToken }));
vi.mock("@/lib/database", () => ({
  getCountryDatabase: () => ({ getConnection: mocks.getConnection }),
}));
vi.mock("@/lib/activity-log", () => ({ logActivity: mocks.logActivity }));

import { PATCH } from "./route";

const VALID_TOKEN = "a".repeat(48);

describe("PATCH /api/patient-portal/[token]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkRateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.verifyRecaptcha.mockResolvedValue(null);
    mocks.findPatientByPortalToken.mockResolvedValue({
      status: "ok",
      country: "RO",
      row: { id: 7, full_name: "Ana", email: "ana@example.test" },
    });
    mocks.query.mockReset();
    mocks.beginTransaction.mockResolvedValue(undefined);
    mocks.commit.mockResolvedValue(undefined);
    mocks.rollback.mockResolvedValue(undefined);
    mocks.release.mockReturnValue(undefined);
    mocks.getConnection.mockResolvedValue({
      query: mocks.query,
      beginTransaction: mocks.beginTransaction,
      commit: mocks.commit,
      rollback: mocks.rollback,
      release: mocks.release,
    });
    mocks.logActivity.mockResolvedValue(undefined);
  });

  it("assigns followups only once and preserves both new_followup and complete_followup in one request (H5)", async () => {
    const existingFollowup = {
      id: "fu-existing",
      title: "Blood pressure check",
      date: "2026-10-01",
      status: "scheduled",
    };
    mocks.query
      .mockResolvedValueOnce([[{ followups: JSON.stringify([existingFollowup]), photos: null }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const response = await PATCH(
      new Request(`http://localhost/api/patient-portal/${VALID_TOKEN}?c=ro`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_followup: { id: "fu-new", title: "Lab follow-up", date: "2026-11-15" },
          complete_followup: {
            followup_id: "fu-existing",
            completion_notes: "Done at clinic",
            completed_at: "2026-10-02T10:00:00.000Z",
          },
        }),
      }),
      { params: Promise.resolve({ token: VALID_TOKEN }) },
    );

    expect(response.status).toBe(200);
    expect(mocks.commit).toHaveBeenCalledOnce();
    const [updateSql, updateParams] = mocks.query.mock.calls[1];
    expect(String(updateSql).match(/\bfollowups\s*=/g)).toHaveLength(1);
    const saved = JSON.parse(String(updateParams[0]));
    expect(saved).toHaveLength(2);
    expect(saved[0]).toMatchObject({ title: "Lab follow-up", date: "2026-11-15" });
    expect(saved[1]).toMatchObject({ id: "fu-existing", status: "completed", completion_notes: "Done at clinic" });
  });
});
