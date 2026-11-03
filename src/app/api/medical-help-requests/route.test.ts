import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  query: vi.fn(), log: vi.fn(), sendEmail: vi.fn(), captcha: vi.fn(), rateLimit: vi.fn(),
}));
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/database", () => ({
  configuredCountries: () => ["RO"],
  getCountryDatabase: () => ({ query: mocks.query }),
}));
vi.mock("@/lib/activity-log", () => ({ logActivity: mocks.log }));
vi.mock("@/lib/email", () => ({ sendHelpRequestConfirmationEmail: mocks.sendEmail }));
vi.mock("@/lib/security/recaptcha", () => ({ verifyRecaptcha: mocks.captcha }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mocks.rateLimit, getClientIp: () => "127.0.0.1",
}));
vi.mock("@/lib/worker-auth", () => ({ getUserWorkerContext: vi.fn() }));

import { POST } from "./route";

function request(overrides: Record<string, unknown> = {}) {
  return new Request("http://localhost/api/medical-help-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Synthetic request", phone: "0001122334", description: "Synthetic request for assistance",
      country: "RO", county: "Cluj", privacyConsent: true, captchaToken: "synthetic-token",
      ...overrides,
    }),
  });
}

describe("public help request optional email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimit.mockResolvedValue({ allowed: true });
    mocks.captcha.mockResolvedValue(null);
    mocks.log.mockResolvedValue(undefined);
    mocks.sendEmail.mockResolvedValue(true);
    mocks.query.mockImplementation(async (_sql: string, values: unknown[]) => {
      if (values[2] == null) throw new Error("Column 'email' cannot be null");
      return [{ insertId: 7 }];
    });
  });

  it.each([undefined, null, "", "   "])("saves email %j on legacy NOT NULL schemas without sending email", async (email) => {
    const response = await POST(request({ email }));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ success: true, email_sent: false });
    expect(mocks.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO medical_help_requests"),
      ["Synthetic request", "0001122334", "", "Synthetic request for assistance", "Cluj"],
    );
    expect(mocks.sendEmail).not.toHaveBeenCalled();
    expect(mocks.log).toHaveBeenCalledWith(expect.objectContaining({
      country: "RO", actorEmail: null, details: expect.objectContaining({ has_email: false }),
    }));
    expect(mocks.captcha).toHaveBeenCalledWith("synthetic-token", "help_request");
  });

  it("normalizes a provided email and sends its confirmation", async () => {
    const response = await POST(request({ email: "  EXAMPLE@example.test  " }));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ success: true, email_sent: true });
    expect(mocks.query.mock.calls[0][1][2]).toBe("example@example.test");
    expect(mocks.sendEmail).toHaveBeenCalledWith(expect.objectContaining({ email: "example@example.test" }));
  });

  it("rejects malformed nonempty email before writing", async () => {
    expect((await POST(request({ email: "not-an-email" }))).status).toBe(400);
    expect(mocks.query).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it.each([{ privacyConsent: false }, { county: "" }, { phone: "" }])("preserves required validation for %j", async (overrides) => {
    expect((await POST(request(overrides))).status).toBe(400);
    expect(mocks.query).not.toHaveBeenCalled();
  });
});
