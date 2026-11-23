import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getUserWorkerContext: vi.fn(),
  query: vi.fn(),
  sendMeetingInvitationEmail: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/worker-auth", () => ({ getUserWorkerContext: mocks.getUserWorkerContext }));
vi.mock("@/lib/database", () => ({
  getCountryDatabase: () => ({ query: mocks.query }),
}));
vi.mock("@/lib/email", () => ({
  sendMeetingInvitationEmail: mocks.sendMeetingInvitationEmail,
}));

import { POST } from "./route";

function callInvite(id: string) {
  return POST(
    new Request(`https://redi.healthcare/api/meetings/${id}/invite`, {
      method: "POST",
      headers: { "x-redihealth-lang": "ro" },
    }),
    { params: Promise.resolve({ id }) } as RouteContext<"/api/meetings/[id]/invite">,
  );
}

describe("POST /api/meetings/[id]/invite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "doctor@example.com" } });
    mocks.getUserWorkerContext.mockResolvedValue({
      country: "RO",
      workerId: "7",
      workerName: "Dr. Ana",
      isAdmin: false,
      isSuperAdmin: false,
      role: "Doctor",
    });
    mocks.query.mockResolvedValue([[
      {
        id: 12,
        title: "Follow-up",
        meeting_url: "https://meet.jit.si/redihealth-12",
        full_name: "Ion Popescu",
        email: "ion@example.com",
      },
    ]]);
    mocks.sendMeetingInvitationEmail.mockResolvedValue(true);
  });

  it("requires current patient assignment for non-admin staff", async () => {
    mocks.query.mockResolvedValueOnce([[]]);
    const res = await callInvite("12");
    expect(res.status).toBe(404);
    const [sql, params] = mocks.query.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain("m.organizer_worker_id = ?");
    expect(sql).toContain("(p.assigned_worker_id = ? OR jsonb_has_id(p.assigned_worker_ids, ?))");
    expect(params).toEqual(["12", "7", "7", "7"]);
    expect(mocks.sendMeetingInvitationEmail).not.toHaveBeenCalled();
  });

  it("returns 502 when email delivery fails instead of silently reporting 200", async () => {
    mocks.sendMeetingInvitationEmail.mockResolvedValueOnce(false);
    const res = await callInvite("12");
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({ error: expect.any(String) });
  });

  it("returns 200 when invitation email delivery succeeds", async () => {
    const res = await callInvite("12");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });
});
