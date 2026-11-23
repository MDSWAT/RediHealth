import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getUserWorkerContext: vi.fn(),
  query: vi.fn(),
  sendPatientPortalLinkEmail: vi.fn(),
  logActivity: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/worker-auth", () => ({ getUserWorkerContext: mocks.getUserWorkerContext }));
vi.mock("@/lib/database", () => ({
  getCountryDatabase: () => ({ query: mocks.query }),
}));
vi.mock("@/lib/email", () => ({
  sendPatientPortalLinkEmail: mocks.sendPatientPortalLinkEmail,
}));
vi.mock("@/lib/activity-log", () => ({
  logActivity: mocks.logActivity,
}));
vi.mock("@/lib/rate-limit", () => ({
  getClientIp: () => "198.51.100.1",
}));

import { POST } from "./route";

describe("POST /api/patients/send-portal-link", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "doctor@example.com" } });
    mocks.getUserWorkerContext.mockResolvedValue({
      country: "RO",
      workerId: "7",
      workerName: "Dr. Ana",
      role: "Doctor",
      isAdmin: false,
      isSuperAdmin: false,
    });
    mocks.query
      .mockResolvedValueOnce([[
        {
          id: 42,
          full_name: "Ana Pop",
          email: "ana@example.com",
          condition_notes: null,
          treatment_plan: null,
          access_token_hash: "old-hash",
        },
      ]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    mocks.sendPatientPortalLinkEmail.mockResolvedValue(true);
    mocks.logActivity.mockResolvedValue(true);
  });

  it("returns 400 on null, array, primitive, or invalid JSON payloads instead of crashing", async () => {
    for (const rawBody of ["null", "[]", '"42"', "123", "{not-json"]) {
      const res = await POST(
        new Request("https://redi.healthcare/api/patients/send-portal-link", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: rawBody,
        }),
      );
      expect(res.status, rawBody).toBe(400);
    }
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it("omits request baseUrl from sendPatientPortalLinkEmail and records an audit log entry", async () => {
    const res = await POST(
      new Request("https://evil.example/api/patients/send-portal-link", {
        method: "POST",
        headers: { "content-type": "application/json", "x-redihealth-lang": "ro" },
        body: JSON.stringify({ id: 42 }),
      }),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, email_sent: true });

    expect(mocks.sendPatientPortalLinkEmail).toHaveBeenCalledTimes(1);
    expect(mocks.sendPatientPortalLinkEmail.mock.calls[0][0]).not.toHaveProperty("baseUrl");

    expect(mocks.logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        country: "RO",
        actorWorkerId: "7",
        actorEmail: "doctor@example.com",
        action: "patient.portal_link_sent",
        entityType: "patient",
        entityId: "42",
        details: { emailSent: true },
        ipAddress: "198.51.100.1",
      }),
    );
  });
});
