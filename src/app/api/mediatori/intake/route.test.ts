import { beforeEach, describe, expect, it, vi } from "vitest";
import { PORTAL_TOKEN_PATTERN } from "@/lib/security/portal-token";
import { isValidEmail } from "@/lib/text";

const mocks = vi.hoisted(() => ({
  requireStaff: vi.fn(),
  isCountryConfigured: vi.fn(),
  getConnection: vi.fn(),
  query: vi.fn(),
  beginTransaction: vi.fn(),
  commit: vi.fn(),
  rollback: vi.fn(),
  release: vi.fn(),
  logActivity: vi.fn(),
}));

vi.mock("@/lib/staff-access", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("@/lib/database", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/database")>(),
  isCountryConfigured: mocks.isCountryConfigured,
  getCountryDatabase: () => ({ getConnection: mocks.getConnection }),
}));
vi.mock("@/lib/activity-log", () => ({ logActivity: mocks.logActivity }));
vi.mock("@/lib/rate-limit", () => ({ getClientIp: () => "127.0.0.1" }));

import { POST } from "./route";

function req(body: unknown) {
  return new Request("http://localhost/api/mediatori/intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/mediatori/intake", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireStaff.mockResolvedValue({
      worker: { country: "RO", workerId: "4", workerName: "Mediator One", role: "Mediator", isAdmin: false, isSuperAdmin: false },
      email: "mediator@example.test",
      name: "Mediator One",
    });
    mocks.isCountryConfigured.mockReturnValue(true);
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

  it("inserts a non-null collision-free placeholder email when email is omitted and logs activity (C2, #7 #11)", async () => {
    mocks.query
      .mockResolvedValueOnce([{ insertId: 42 }])
      .mockResolvedValueOnce([{ insertId: 99 }]);

    const response = await POST(req({
      fullName: "Maria Popescu",
      phone: "0721 000 111",
      county: "Cluj",
      symptomCategory: "Cardiologie",
    }));

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toMatchObject({ success: true, patientId: 42 });
    expect(PORTAL_TOKEN_PATTERN.test(data.portalToken)).toBe(true);

    const [patientSql, patientParams] = mocks.query.mock.calls[0];
    expect(patientSql).toContain("email");
    const insertedEmail = String(patientParams[2]);
    expect(insertedEmail).toMatch(/^no-email-[a-f0-9]{16}@intake\.redi\.invalid$/);
    expect(isValidEmail(insertedEmail)).toBe(true);
    expect(mocks.commit).toHaveBeenCalledOnce();
    expect(mocks.release).toHaveBeenCalledOnce();
    expect(mocks.logActivity).toHaveBeenCalledWith(expect.objectContaining({
      country: "RO",
      actorWorkerId: "4",
      action: "patient.intake_created",
      entityType: "patient",
      entityId: 42,
      details: expect.objectContaining({ portal_token_issued: true, has_email: false }),
    }));
  });

  it("uses and validates an explicit email when provided and returns 409 on duplicate email (C2)", async () => {
    expect((await POST(req({ fullName: "Maria", phone: "0721", email: "not-an-email" }))).status).toBe(400);
    expect(mocks.getConnection).not.toHaveBeenCalled();

    mocks.query.mockRejectedValueOnce({ code: "23505" });
    const dupResponse = await POST(req({ fullName: "Maria", phone: "0721", email: "maria@example.test" }));
    expect(dupResponse.status).toBe(409);
    expect(mocks.rollback).toHaveBeenCalledOnce();
    expect(mocks.logActivity).not.toHaveBeenCalled();
  });

  it("returns 503 cleanly when getConnection fails (C2)", async () => {
    mocks.getConnection.mockRejectedValueOnce(new Error("pool exhausted"));
    const response = await POST(req({ fullName: "Maria", phone: "0721" }));
    expect(response.status).toBe(503);
    expect(mocks.logActivity).not.toHaveBeenCalled();
  });
});
