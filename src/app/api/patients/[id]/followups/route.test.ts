import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), worker: vi.fn(), create: vi.fn(), email: vi.fn(), log: vi.fn() }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/worker-auth", () => ({ getUserWorkerContext: mocks.worker }));
vi.mock("@/lib/data/followups", () => ({ createFollowup: mocks.create, FollowupError: class extends Error {} }));
vi.mock("@/lib/email", () => ({ sendMeetingInvitationEmail: mocks.email }));
vi.mock("@/lib/activity-log", () => ({ logActivity: mocks.log }));
vi.mock("@/lib/rate-limit", () => ({ getClientIp: () => "127.0.0.1" }));
import { POST } from "./route";

describe("follow-up API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "staff@example.com" } });
    mocks.worker.mockResolvedValue({ workerId: "2", isAdmin: false });
    mocks.log.mockResolvedValue(undefined);
  });
  const request = (lang?: string) => new Request("http://localhost/api/patients/7/followups", {
    method: "POST",
    headers: lang ? { "x-redihealth-lang": lang } : undefined,
    body: JSON.stringify({ title: "Review", date: "2026-10-02" }),
  });
  const params = { params: Promise.resolve({ id: "7" }) };
  it("reports failed invitations as saved appointments, so retry does not duplicate them", async () => {
    mocks.create.mockResolvedValue({ created: true, name: "Patient", email: "patient@example.com", followup: { id: "stable", meeting_url: "https://meet.jit.si/room", title: "Review", date: "2026-10-02" } });
    mocks.email.mockRejectedValue(new Error("Mail service offline"));
    const response = await POST(request(), params);
    expect(response.status).toBe(201); expect(await response.json()).toMatchObject({ email_sent: false, followup: { id: "stable" } });
  });
  it("does not send another invitation for a previously saved retry", async () => {
    mocks.create.mockResolvedValue({ created: false, followup: { id: "stable", meeting_url: "https://meet.jit.si/room" } });
    expect((await POST(request(), params)).status).toBe(200);
    expect(mocks.email).not.toHaveBeenCalled(); expect(mocks.log).not.toHaveBeenCalled();
  });
  it("sends the panel language with the appointment invitation", async () => {
    mocks.create.mockResolvedValue({ created: true, name: "Patient", email: "patient@example.com", followup: { id: "localized", meeting_url: "https://meet.jit.si/room", title: "Review", date: "2026-10-02" } });
    mocks.email.mockResolvedValue(true);
    await POST(request("ro"), params);
    expect(mocks.email).toHaveBeenCalledWith(expect.objectContaining({ lang: "ro" }));
  });
  it("rejects unauthenticated and nonstaff requests before saving", async () => {
    mocks.auth.mockResolvedValueOnce(null);
    expect((await POST(request(), params)).status).toBe(401);
    mocks.worker.mockResolvedValueOnce({ workerId: null });
    expect((await POST(request(), params)).status).toBe(403);
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
