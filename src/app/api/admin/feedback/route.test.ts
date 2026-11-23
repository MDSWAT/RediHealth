import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getUserWorkerContext: vi.fn(),
  query: vi.fn(),
  logActivity: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/worker-auth", () => ({ getUserWorkerContext: mocks.getUserWorkerContext }));
vi.mock("@/lib/database", () => ({
  hasControlDatabase: () => true,
  getControlDatabase: () => ({ query: mocks.query }),
}));
vi.mock("@/lib/activity-log", () => ({
  logActivity: mocks.logActivity,
}));
vi.mock("@/lib/rate-limit", () => ({
  getClientIp: () => "198.51.100.1",
}));

import { DELETE, GET } from "./route";

describe("/api/admin/feedback tenant scoping and limit sanitization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "admin-md@example.com" } });
    mocks.getUserWorkerContext.mockResolvedValue({
      country: "MD",
      workerId: "20",
      workerName: "MD Admin",
      role: "Administrator",
      isAdmin: true,
      isSuperAdmin: false,
    });
    // First query inside platform-feedback may be ensureFeedbackTable (CREATE TABLE) then SELECT/DELETE.
    mocks.query.mockImplementation(async (sql: string) => {
      if (sql.includes("CREATE TABLE")) return [[]];
      if (sql.startsWith("DELETE")) return [{ affectedRows: 0 }];
      return [[]];
    });
    mocks.logActivity.mockResolvedValue(true);
  });

  it("forces country-scoped Administrators to their own country even when ?country=RO is supplied", async () => {
    const res = await GET(
      new Request("https://redi.healthcare/api/admin/feedback?country=RO&limit=50"),
    );
    expect(res.status).toBe(200);

    const selectCall = mocks.query.mock.calls.find(
      ([sql]) => typeof sql === "string" && sql.includes("SELECT id, country_code"),
    );
    expect(selectCall).toBeDefined();
    expect(selectCall?.[0]).toContain("country_code = ?");
    expect(selectCall?.[1]).toEqual(["MD", 50]);
  });

  it("sanitizes non-finite limit params so NaN is never passed to SQL LIMIT", async () => {
    for (const badLimit of ["abc", "NaN", "Infinity", "-Infinity"]) {
      mocks.query.mockClear();
      const res = await GET(
        new Request(`https://redi.healthcare/api/admin/feedback?limit=${badLimit}`),
      );
      expect(res.status).toBe(200);
      const selectCall = mocks.query.mock.calls.find(
        ([sql]) => typeof sql === "string" && sql.includes("SELECT id, country_code"),
      );
      expect(selectCall?.[1]).toEqual(["MD", 250]);
    }
  });

  it("scopes Administrator deletes strictly to their own country_code", async () => {
    const res = await DELETE(
      new Request("https://redi.healthcare/api/admin/feedback?id=77", { method: "DELETE" }),
    );
    expect(res.status).toBe(404);

    const deleteCall = mocks.query.mock.calls.find(
      ([sql]) => typeof sql === "string" && sql.startsWith("DELETE FROM platform_feedback"),
    );
    expect(deleteCall).toEqual([
      "DELETE FROM platform_feedback WHERE id = ? AND country_code = ?",
      [77, "MD"],
    ]);
  });

  it("allows Super Admins to read and delete across countries", async () => {
    mocks.getUserWorkerContext.mockResolvedValue({
      country: "RO",
      workerId: "1",
      workerName: "Super Admin",
      role: "Super Admin",
      isAdmin: true,
      isSuperAdmin: true,
    });
    mocks.query.mockImplementation(async (sql: string) => {
      if (sql.includes("CREATE TABLE")) return [[]];
      if (sql.startsWith("DELETE")) return [{ affectedRows: 1 }];
      return [[]];
    });

    const getRes = await GET(
      new Request("https://redi.healthcare/api/admin/feedback?country=MD&limit=25"),
    );
    expect(getRes.status).toBe(200);
    const selectCall = mocks.query.mock.calls.find(
      ([sql]) => typeof sql === "string" && sql.includes("SELECT id, country_code"),
    );
    expect(selectCall?.[1]).toEqual(["MD", 25]);

    const delRes = await DELETE(
      new Request("https://redi.healthcare/api/admin/feedback?id=77", { method: "DELETE" }),
    );
    expect(delRes.status).toBe(200);
    const deleteCall = mocks.query.mock.calls.find(
      ([sql]) => typeof sql === "string" && sql.startsWith("DELETE FROM platform_feedback"),
    );
    expect(deleteCall).toEqual(["DELETE FROM platform_feedback WHERE id = ?", [77]]);
  });
});
