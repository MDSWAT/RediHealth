import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  worker: vi.fn(),
  query: vi.fn(),
  connQuery: vi.fn(),
  getConnection: vi.fn(),
  beginTransaction: vi.fn(),
  commit: vi.fn(),
  rollback: vi.fn(),
  release: vi.fn(),
  logActivity: vi.fn(),
  sendInvite: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/worker-auth", () => ({ getUserWorkerContext: mocks.worker }));
vi.mock("@/lib/database", () => ({
  getCountryDatabase: () => ({ query: mocks.query, getConnection: mocks.getConnection }),
}));
vi.mock("@/lib/activity-log", () => ({ logActivity: mocks.logActivity }));
vi.mock("@/lib/email", () => ({ sendMeetingInvitationEmail: mocks.sendInvite }));
vi.mock("@/lib/i18n/server-routing", () => ({ getRequestLang: async () => "en" }));
vi.mock("@/lib/rate-limit", () => ({ getClientIp: () => "127.0.0.1" }));

import { DELETE, GET, PATCH, POST } from "./route";

describe("/api/meetings reliability and access control", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "doctor@example.test" } });
    mocks.worker.mockResolvedValue({
      country: "RO",
      workerId: "2",
      workerName: "Dr. Two",
      role: "Doctor",
      isAdmin: false,
    });
    mocks.query.mockReset();
    mocks.connQuery.mockReset();
    mocks.beginTransaction.mockResolvedValue(undefined);
    mocks.commit.mockResolvedValue(undefined);
    mocks.rollback.mockResolvedValue(undefined);
    mocks.release.mockReturnValue(undefined);
    mocks.getConnection.mockResolvedValue({
      query: mocks.connQuery,
      beginTransaction: mocks.beginTransaction,
      commit: mocks.commit,
      rollback: mocks.rollback,
      release: mocks.release,
    });
    mocks.logActivity.mockResolvedValue(undefined);
    mocks.sendInvite.mockResolvedValue(true);
  });

  it("rejects null and array JSON payloads on POST and PATCH with 400 (M3)", async () => {
    for (const payload of ["null", "[]"]) {
      expect((await POST(new Request("http://localhost/api/meetings", { method: "POST", body: payload }))).status).toBe(400);
      expect((await PATCH(new Request("http://localhost/api/meetings", { method: "PATCH", body: payload }))).status).toBe(400);
    }
    expect(mocks.getConnection).not.toHaveBeenCalled();
  });

  it("returns 503 cleanly when getConnection fails on PATCH and DELETE (H6)", async () => {
    mocks.getConnection.mockRejectedValue(new Error("pool timeout"));
    expect((await PATCH(new Request("http://localhost/api/meetings", {
      method: "PATCH",
      body: JSON.stringify({ id: "12", transcript: "notes" }),
    }))).status).toBe(503);
    expect((await DELETE(new Request("http://localhost/api/meetings?id=12", { method: "DELETE" }))).status).toBe(503);
  });

  it("allows deleting an orphaned meeting whose linked follow-up was already removed and logs after commit (H6)", async () => {
    const callOrder: string[] = [];
    mocks.commit.mockImplementation(async () => { callOrder.push("commit"); });
    mocks.release.mockImplementation(() => { callOrder.push("release"); });
    mocks.logActivity.mockImplementation(async () => { callOrder.push("logActivity"); });

    mocks.connQuery
      .mockResolvedValueOnce([[{ patient_id: 9, followup_id: "removed-fu" }]])
      .mockResolvedValueOnce([[{ followups: JSON.stringify([]) }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const response = await DELETE(new Request("http://localhost/api/meetings?id=12", { method: "DELETE" }));
    expect(response.status).toBe(200);
    expect(mocks.connQuery).toHaveBeenCalledTimes(3);
    expect(String(mocks.connQuery.mock.calls[2][0])).toContain("DELETE FROM meetings WHERE id = ?");
    expect(callOrder).toEqual(["commit", "release", "logActivity"]);
  });

  it("enforces current patient assignment for non-admin staff on GET, PATCH, and DELETE (#7 #8)", async () => {
    mocks.query.mockResolvedValueOnce([[]]);
    expect((await GET(new Request("http://localhost/api/meetings?id=12"))).status).toBe(404);
    const getSql = String(mocks.query.mock.calls[0][0]);
    expect(getSql).toContain("LEFT JOIN patients p ON p.id = m.patient_id");
    expect(getSql).toContain("p.assigned_worker_id = ? OR jsonb_has_id(p.assigned_worker_ids, ?)");
    expect(mocks.query.mock.calls[0][1]).toEqual(["12", "2", "2", "2"]);

    mocks.connQuery.mockResolvedValueOnce([[]]);
    expect((await PATCH(new Request("http://localhost/api/meetings", {
      method: "PATCH",
      body: JSON.stringify({ id: "12", transcript: "updated" }),
    }))).status).toBe(404);
    const patchSql = String(mocks.connQuery.mock.calls[0][0]);
    expect(patchSql).toContain("LEFT JOIN patients p ON p.id = m.patient_id");
    expect(patchSql).toContain("FOR UPDATE OF m");
    expect(mocks.connQuery.mock.calls[0][1]).toEqual(["12", "2", "2", "2"]);

    mocks.connQuery.mockResolvedValueOnce([[]]);
    expect((await DELETE(new Request("http://localhost/api/meetings?id=12", { method: "DELETE" }))).status).toBe(404);
    const deleteSql = String(mocks.connQuery.mock.calls[1][0]);
    expect(deleteSql).toContain("LEFT JOIN patients p ON p.id = m.patient_id");
    expect(deleteSql).toContain("FOR UPDATE OF m");
  });

  it("swallows rollback errors so the route still returns 503 and releases the connection (H6)", async () => {
    mocks.connQuery.mockRejectedValueOnce(new Error("query boom"));
    mocks.rollback.mockRejectedValueOnce(new Error("rollback boom"));
    const response = await DELETE(new Request("http://localhost/api/meetings?id=12", { method: "DELETE" }));
    expect(response.status).toBe(503);
    expect(mocks.release).toHaveBeenCalledOnce();
  });
});
