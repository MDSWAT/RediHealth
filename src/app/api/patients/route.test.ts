import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), worker: vi.fn(), query: vi.fn(), log: vi.fn() }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/worker-auth", () => ({ getUserWorkerContext: mocks.worker }));
vi.mock("@/lib/database", () => ({ getDatabase: () => ({ query: mocks.query }) }));
vi.mock("@/lib/email", () => ({ sendPatientPortalLinkEmail: vi.fn() }));
vi.mock("@/lib/activity-log", () => ({ logActivity: mocks.log }));
vi.mock("@/lib/rate-limit", () => ({ getClientIp: () => "127.0.0.1" }));

import { PATCH, POST } from "./route";

const entries = [
  { id: "one", title: "First course", start_date: "2026-10-01", end_date: "2026-10-07", medications: "First therapy" },
  { id: "two", title: "Second course", start_date: "2026-10-03", end_date: "2026-10-12", medications: "Second therapy" },
];
function request(method: string, body: object) {
  return new Request("http://localhost/api/patients", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

describe("patient treatment persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "staff@example.com" } });
    mocks.worker.mockResolvedValue({ workerId: "2", isAdmin: false });
    mocks.query.mockResolvedValue([{ affectedRows: 1 }]);
    mocks.log.mockResolvedValue(undefined);
  });

  it("persists every plan and retains staff assignment restrictions", async () => {
    const response = await PATCH(request("PATCH", { id: "7", treatment_plan: { entries } }));
    expect(response.status).toBe(200);
    expect(mocks.query).toHaveBeenCalledWith(expect.stringContaining("assigned_worker_id = ?"), [expect.any(String), "7", "2", "2"]);
    expect(JSON.parse(mocks.query.mock.calls[0][1][0])).toEqual({ entries });
    expect(await response.json()).toEqual({ success: true });
  });

  it("creates a patient with multiple treatment plans in the existing JSON column", async () => {
    mocks.query.mockResolvedValueOnce([{ insertId: 7 }]);
    const response = await POST(request("POST", { full_name: "Test", email: "test@example.com", phone: "123", treatment_plan: { entries } }));
    expect(response.status).toBe(201);
    expect(mocks.query.mock.calls[0][0]).toContain("INSERT INTO patients");
    expect(JSON.parse(mocks.query.mock.calls[0][1][13])).toEqual({ entries });
  });

  it("persists editing and deletion without dropping another course", async () => {
    const updated = [{ ...entries[1], medications: "Updated second therapy" }];
    expect((await PATCH(request("PATCH", { id: "7", treatment_plan: { entries: updated } }))).status).toBe(200);
    expect(JSON.parse(mocks.query.mock.calls[0][1][0])).toEqual({ entries: updated });
    expect((await PATCH(request("PATCH", { id: "7", treatment_plan: { entries: [] } }))).status).toBe(200);
    expect(mocks.query.mock.calls[1][1][0]).toBe('{"entries":[]}');
  });

  it("rejects invalid dates before any write for both create and update", async () => {
    const treatment_plan = { entries: [{ ...entries[0], end_date: "2026-09-01" }] };
    expect((await PATCH(request("PATCH", { id: "7", treatment_plan }))).status).toBe(400);
    expect((await POST(request("POST", { full_name: "Test", email: "test@example.com", phone: "123", treatment_plan }))).status).toBe(400);
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it("reports missing patients instead of claiming success", async () => {
    mocks.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
    expect((await PATCH(request("PATCH", { id: "7", treatment_plan: { entries } }))).status).toBe(404);
  });
});
