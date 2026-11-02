import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), worker: vi.fn(), query: vi.fn(), log: vi.fn() }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/worker-auth", () => ({ getUserWorkerContext: mocks.worker }));
vi.mock("@/lib/database", () => ({ getCountryDatabase: () => ({ query: mocks.query }) }));
vi.mock("@/lib/activity-log", () => ({ logActivity: mocks.log }));
vi.mock("@/lib/rate-limit", () => ({ getClientIp: () => "127.0.0.1" }));

import { POST } from "./route";

function request(body: object) {
  return new Request("http://localhost/api/workers", {
    method: "POST",
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
});
