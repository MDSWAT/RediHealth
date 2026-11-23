import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getHandler: vi.fn(),
  postHandler: vi.fn(),
  rateLimit: vi.fn(),
  captcha: vi.fn(),
}));

vi.mock("@/auth", () => ({
  handlers: {
    GET: mocks.getHandler,
    POST: mocks.postHandler,
  },
}));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mocks.rateLimit,
  getClientIp: () => "198.51.100.25",
}));
vi.mock("@/lib/security/recaptcha", () => ({
  verifyRecaptcha: mocks.captcha,
}));

import { GET, POST } from "./route";

function postForm(path: string, fields: Record<string, string>) {
  return new NextRequest(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields).toString(),
  });
}

describe("/api/auth/[...nextauth] route protection", () => {
  beforeEach(() => {
    mocks.getHandler.mockReset().mockResolvedValue(Response.json({ ok: true }));
    mocks.postHandler.mockReset().mockResolvedValue(Response.json({ url: "http://localhost/en/panel" }));
    mocks.rateLimit.mockReset().mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.captcha.mockReset().mockResolvedValue(null);
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 404 for unknown auth actions without invoking handlers", async () => {
    const res = await GET(new NextRequest("http://localhost/api/auth/does-not-exist"));
    expect(res.status).toBe(404);
    expect(mocks.getHandler).not.toHaveBeenCalled();
  });

  it("rate-limits POST /api/auth/callback/admin-password and returns Auth.js-safe 429 payload", async () => {
    mocks.rateLimit.mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 120 });
    const res = await POST(postForm("/api/auth/callback/admin-password", { email: "admin@example.com", password: "secret" }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("120");
    const data = await res.json();
    expect(data.code).toBe("rate_limited");
    expect(() => new URL(data.url)).not.toThrow();
    expect(mocks.postHandler).not.toHaveBeenCalled();
  });

  it("rate-limits POST /api/auth/callback/email-code", async () => {
    mocks.rateLimit.mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 45 });
    const res = await POST(postForm("/api/auth/callback/email-code", { code: "123456" }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("45");
    expect(mocks.postHandler).not.toHaveBeenCalled();
  });

  it("enforces reCAPTCHA and rate limits on Google OAuth sign-in", async () => {
    mocks.captcha.mockResolvedValueOnce(
      Response.json({ error: "Bot verification failed.", code: "captcha_invalid" }, { status: 400 }),
    );
    const failed = await POST(postForm("/api/auth/signin/google", { captchaToken: "bad-token" }));
    expect(failed.status).toBe(400);
    const body = await failed.json();
    expect(body.code).toBe("captcha_invalid");
    expect(() => new URL(body.url)).not.toThrow();
    expect(mocks.captcha).toHaveBeenCalledWith("bad-token", "google_sign_in");
    expect(mocks.postHandler).not.toHaveBeenCalled();

    const ok = await POST(postForm("/api/auth/signin/google", { captchaToken: "good-token" }));
    expect(ok.status).toBe(200);
    expect(mocks.captcha).toHaveBeenLastCalledWith("good-token", "google_sign_in");
    expect(mocks.postHandler).toHaveBeenCalledTimes(1);
  });

  it("rejects auth POST submissions when the anti-spam honeypot field is filled", async () => {
    const res = await POST(postForm("/api/auth/signin/google", { website: "https://spam.example", captchaToken: "tok" }));
    expect(res.status).toBe(400);
    expect((await res.json()).code).toBe("spam_detected");
    expect(mocks.captcha).not.toHaveBeenCalled();
    expect(mocks.postHandler).not.toHaveBeenCalled();
  });

  it("rate-limits GET /api/auth/callback/google", async () => {
    mocks.rateLimit.mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 30 });
    const res = await GET(new NextRequest("http://localhost/api/auth/callback/google?code=abc"));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("30");
    expect(mocks.getHandler).not.toHaveBeenCalled();
  });
});
