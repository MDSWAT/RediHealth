import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  access: vi.fn(),
  sendEmail: vi.fn(),
  set: vi.fn(),
  captcha: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({ set: mocks.set }),
}));
vi.mock("@/lib/login-access", () => ({ checkLoginAccess: mocks.access }));
vi.mock("@/lib/security/recaptcha", () => ({ verifyRecaptcha: mocks.captcha }));
vi.mock("@/lib/email", () => ({
  isEmailConfigured: () => true,
  renderBrandEmail: () => "<p>code</p>",
  sendEmail: mocks.sendEmail,
}));

import { POST } from "./route";

function request(body: string, ip = "198.51.100.10") {
  return new Request("http://localhost/api/auth/email-code/request", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body,
  });
}

describe("email code request route", () => {
  beforeEach(() => {
    vi.stubEnv("AUTH_SECRET", "test-only-email-code-secret");
    vi.stubEnv("REDIHEALTH_TRUST_PROXY_HEADERS", "true");
    mocks.access.mockReset().mockResolvedValue({ allowed: true, reason: "authorized" });
    mocks.sendEmail.mockReset().mockResolvedValue(undefined);
    mocks.set.mockReset();
    mocks.captcha.mockReset().mockResolvedValue(null);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 400 for an invalid JSON payload", async () => {
    const response = await POST(request("{"));
    expect(response.status).toBe(400);
  });

  it("returns 400 for a malformed email address", async () => {
    const response = await POST(request(JSON.stringify({ email: "not-an-email" })));
    expect(response.status).toBe(400);
  });

  it("emails a code without putting it in the subject and stores the encrypted token", async () => {
    const response = await POST(request(JSON.stringify({ email: "staff@example.com" }), "198.51.100.20"));
    expect(response.status).toBe(200);
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "staff@example.com", subject: "Your RediHealth verification code" }),
    );
    expect(mocks.set).toHaveBeenCalledWith("redihealth_email_otp", expect.any(String), expect.objectContaining({ httpOnly: true }));
  });

  it("blocks email sending and account lookups when bot verification fails", async () => {
    mocks.captcha.mockResolvedValue(new Response(JSON.stringify({ error: "Bot verification failed." }), { status: 400 }));
    const response = await POST(request(JSON.stringify({ email: "staff@example.com" }), "198.51.100.50"));
    expect(response.status).toBe(400);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
    expect(mocks.access).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it("answers unknown addresses exactly like known ones without sending anything", async () => {
    mocks.access.mockResolvedValue({ allowed: false, reason: "unauthorized" });
    const response = await POST(request(JSON.stringify({ email: "stranger@example.com" }), "198.51.100.30"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it.each([401, 403, 422, 429, 500, 502])("logs provider status %i without exposing email request data", async (status) => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.sendEmail.mockRejectedValue({
      response: { status, data: { error: "sensitive provider response" } },
      config: { headers: { Authorization: "secret-token" }, data: "private email and code" },
    });

    const response = await POST(request(JSON.stringify({ email: `failure-${status}@example.com` }), `198.51.100.${status}`));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Could not send your sign-in code. Try again." });
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith("Sign-in email delivery failed.", {
      providerStatus: status,
      transportCode: undefined,
    });
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it.each(["ETIMEDOUT", "ECONNRESET", "ENOTFOUND"])("logs the known transport error %s", async (code) => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.sendEmail.mockRejectedValue({ code });

    const response = await POST(request(JSON.stringify({ email: `failure-${code}@example.com` }), `test-${code}`));

    expect(response.status).toBe(502);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith("Sign-in email delivery failed.", {
      providerStatus: undefined,
      transportCode: code,
    });
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it.each([null, "private error text", { code: "private value", response: { status: "private value" } }])(
    "does not log unrecognized errors or arbitrary fields",
    async (error) => {
      const log = vi.spyOn(console, "error").mockImplementation(() => {});
      mocks.sendEmail.mockRejectedValue(error);

      const response = await POST(request(JSON.stringify({ email: "opaque-failure@example.com" }), "198.51.100.60"));

      expect(response.status).toBe(502);
      expect(log).toHaveBeenCalledTimes(1);
      expect(log).toHaveBeenCalledWith("Sign-in email delivery failed.", {
        providerStatus: undefined,
        transportCode: undefined,
      });
      expect(mocks.set).not.toHaveBeenCalled();
    },
  );

  it("allows 10 requests per IP per minute and returns 429 when exceeded", async () => {
    let response = await POST(request("{", "198.51.100.40"));
    for (let i = 0; i < 9; i += 1) {
      response = await POST(request("{", "198.51.100.40"));
    }
    expect(response.status).toBe(400);

    response = await POST(request("{", "198.51.100.40"));
    expect(response.status).toBe(429);
  });
});
