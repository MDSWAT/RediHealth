import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  worker: vi.fn(),
  query: vi.fn(),
  connQuery: vi.fn(),
  beginTransaction: vi.fn(),
  commit: vi.fn(),
  rollback: vi.fn(),
  release: vi.fn(),
  getConnection: vi.fn(),
  log: vi.fn(),
}));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/worker-auth", () => ({ getUserWorkerContext: mocks.worker }));
vi.mock("@/lib/database", () => ({
  getCountryDatabase: () => ({ query: mocks.query, getConnection: mocks.getConnection }),
}));
vi.mock("@/lib/activity-log", () => ({ logActivity: mocks.log }));
vi.mock("@/lib/rate-limit", () => ({ getClientIp: () => "127.0.0.1" }));

import { GET, PATCH, POST } from "./route";
import { loadWorkers } from "@/lib/data/workers";

function request(body: unknown, method = "POST") {
  return new Request("http://localhost/api/workers", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("worker county assignment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "admin@example.com" } });
    mocks.worker.mockResolvedValue({
      country: "RO",
      workerId: "1",
      workerName: "Admin",
      role: "Administrator",
      isAdmin: true,
      isSuperAdmin: false,
    });
    mocks.query.mockResolvedValue([{ insertId: 7 }]);
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
    mocks.log.mockResolvedValue(undefined);
  });

  it.each(["Doctor", "Mediator", "General Practitioner"])("requires a Romanian county for a %s", async (role) => {
    const response = await POST(request({
      full_name: "Test Worker",
      email: "worker@example.com",
      role,
    }));

    expect(response.status).toBe(400);
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it("persists the selected county for a mediator", async () => {
    const response = await POST(request({
      full_name: "Test Mediator",
      email: "mediator@example.com",
      role: "Mediator",
      county: "Cluj",
    }));

    expect(response.status).toBe(201);
    expect(mocks.query.mock.calls[0][0]).toContain("department, county, status");
    expect(mocks.query.mock.calls[0][1]).toContain("Cluj");
  });

  it("rejects counties that are not in the Romanian county list", async () => {
    const response = await POST(request({
      full_name: "Test Doctor",
      email: "doctor@example.com",
      role: "Doctor",
      county: "Invalid",
    }));

    expect(response.status).toBe(400);
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it("rejects null or non-object JSON payloads on POST with 400 (M3)", async () => {
    expect((await POST(request(null, "POST"))).status).toBe(400);
    expect((await POST(request([], "POST"))).status).toBe(400);
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it("preserves co-assigned clinicians inside one transaction on PATCH assign/unassign (H4)", async () => {
    mocks.connQuery
      .mockResolvedValueOnce([[{ id: 2, role: "Doctor" }]]) // loadTargetWorker
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE workers
      .mockResolvedValueOnce([[{ id: 10, assigned_worker_id: 5, assigned_worker_ids: JSON.stringify(["5"]) }]]) // SELECT assign
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE patient 10
      .mockResolvedValueOnce([[{ id: 11, assigned_worker_id: 2, assigned_worker_ids: JSON.stringify(["2", "5"]) }]]) // SELECT unassign
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE patient 11

    const response = await PATCH(request({
      id: "2",
      full_name: "Dr. Two",
      assign_patient_ids: ["10"],
      unassign_patient_ids: [11],
    }, "PATCH"));

    expect(response.status).toBe(200);
    expect(mocks.beginTransaction).toHaveBeenCalledOnce();
    expect(mocks.commit).toHaveBeenCalledOnce();
    expect(mocks.rollback).not.toHaveBeenCalled();
    expect(mocks.release).toHaveBeenCalledOnce();
    // Patient 10 keeps primary worker 5 and adds worker 2
    expect(mocks.connQuery.mock.calls[3][1]).toEqual(["5", '["5","2"]', 10]);
    // Patient 11 removes worker 2 and promotes co-assigned worker 5
    expect(mocks.connQuery.mock.calls[5][1]).toEqual(["5", '["5"]', 11]);
  });

  it("validates patient ID arrays before opening a DB transaction on PATCH (H4)", async () => {
    expect((await PATCH(request({ id: "2", assign_patient_ids: ["abc"] }, "PATCH"))).status).toBe(400);
    expect((await PATCH(request({ id: "2", unassign_patient_ids: "10" }, "PATCH"))).status).toBe(400);
    expect((await PATCH(request({ id: "2", assign_patient_ids: Array.from({ length: 201 }, (_, i) => i + 1) }, "PATCH"))).status).toBe(400);
    expect(mocks.getConnection).not.toHaveBeenCalled();
  });

  it("rolls back the transaction if a bulk assignment query fails (H4)", async () => {
    mocks.connQuery
      .mockResolvedValueOnce([[{ id: 2, role: "Doctor" }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockRejectedValueOnce(new Error("DB write error"));

    const response = await PATCH(request({
      id: "2",
      full_name: "Dr. Two",
      assign_patient_ids: ["10"],
    }, "PATCH"));

    expect(response.status).toBe(503);
    expect(mocks.rollback).toHaveBeenCalledOnce();
    expect(mocks.commit).not.toHaveBeenCalled();
    expect(mocks.release).toHaveBeenCalledOnce();
    expect(mocks.log).not.toHaveBeenCalled();
  });

  it("counts co-assigned patients in GET /api/workers and bounds loadWorkers with LIMIT (M5)", async () => {
    mocks.query.mockResolvedValueOnce([[]]).mockResolvedValueOnce([[]]);
    expect((await GET(new Request("http://localhost/api/workers"))).status).toBe(200);
    expect(String(mocks.query.mock.calls[0][0])).toContain("jsonb_has_id(p.assigned_worker_ids, w.id::text)");

    await loadWorkers("RO");
    const loadSql = String(mocks.query.mock.calls[1][0]);
    expect(loadSql).toContain("jsonb_has_id(p.assigned_worker_ids, w.id::text)");
    expect(loadSql).toContain("LIMIT ?");
    expect(mocks.query.mock.calls[1][1]).toEqual([500]);
  });
});
