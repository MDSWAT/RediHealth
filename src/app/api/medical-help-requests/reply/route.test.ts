import { beforeEach, describe, expect, it, vi } from "vitest";
import { languages } from "@/lib/i18n/translations";
import { helpReplyContent } from "@/lib/i18n/email-translations";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), query: vi.fn(), send: vi.fn(), log: vi.fn() }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/worker-auth", () => ({ getUserWorkerContext: async () => ({ workerId: "staff-1", country: "RO", workerName: "Staff", role: "mediator" }) }));
vi.mock("@/lib/database", () => ({ getCountryDatabase: () => ({ query: mocks.query }) }));
vi.mock("@/lib/activity-log", () => ({ logActivity: mocks.log }));
vi.mock("@/lib/email", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/email")>(),
  isEmailConfigured: () => true,
  sendEmail: mocks.send,
}));
import { POST } from "./route";

describe("localized staff reply delivery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { email: "staff@example.test" } });
    mocks.query.mockResolvedValue([[{ full_name: "Ana", email: "ana@example.test", phone: "000123456", description: "A synthetic request" }]]);
  });

  it.each(languages)("delivers the preview language $code through the reply endpoint", async ({ code }) => {
    const response = await POST(new Request("http://localhost/api/medical-help-requests/reply", {
      method: "POST", headers: { "Content-Type": "application/json", "x-redihealth-lang": code },
      body: JSON.stringify({ requestId: "request-1", templateId: "acknowledgment" }),
    }));
    expect(response.status).toBe(200);
    const expected = helpReplyContent({ templateId: "acknowledgment", lang: code, name: "Ana", phone: "000123456", description: "A synthetic request" });
    expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({ to: "ana@example.test", subject: expected.subject, text: expected.text }));
    expect(mocks.send.mock.calls[0][0].html.includes(`<html lang="${code}"`)).toBe(true);
  });

  it("does not send emails for unauthenticated requests", async () => {
    mocks.auth.mockResolvedValue(null);
    const response = await POST(new Request("http://localhost/api/medical-help-requests/reply", { method: "POST" }));
    expect(response.status).toBe(401);
    expect(mocks.send).not.toHaveBeenCalled();
  });
});
