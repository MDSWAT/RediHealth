import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextAuthConfig } from "next-auth";
import type { CredentialsConfig } from "next-auth/providers/credentials";
import { encryptEmailCode, emailAuthCookies } from "@/lib/email-auth";

const mocks = vi.hoisted(() => ({
  config: vi.fn<(config: NextAuthConfig) => void>(),
  get: vi.fn(),
  delete: vi.fn(),
  access: vi.fn(),
  rateLimit: vi.fn(),
  captcha: vi.fn(),
}));

vi.mock("next-auth", () => ({
  default: (config: NextAuthConfig) => {
    mocks.config(config);
    return {};
  },
}));
vi.mock("next-auth/providers/credentials", () => ({
  default: (config: Partial<CredentialsConfig>) => ({ type: "credentials", ...config }),
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: mocks.get, delete: mocks.delete }),
}));
vi.mock("@/lib/login-access", () => ({
  hasLoginAccess: mocks.access,
  checkLoginAccess: vi.fn(),
}));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mocks.rateLimit,
  getClientIp: () => "198.51.100.1",
}));
vi.mock("@/lib/security/recaptcha", () => ({ verifyRecaptcha: mocks.captcha }));

import "@/auth";

const config = mocks.config.mock.calls[0][0];
const provider = config.providers.find(
  (item) => typeof item !== "function" && item.type === "credentials",
) as CredentialsConfig;

function authorize(code: string) {
  return provider.authorize({ code }, new Request("http://localhost/api/auth/callback/email-code"));
}

describe("email-code credentials", () => {
  beforeEach(() => {
    vi.stubEnv("AUTH_SECRET", "test-only-email-code-secret");
    mocks.get.mockReset();
    mocks.delete.mockReset();
    mocks.access.mockReset().mockResolvedValue(true);
    mocks.rateLimit.mockReset().mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.captcha.mockReset().mockResolvedValue(null);
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  async function setCodeCookie() {
    const token = await encryptEmailCode({ email: "test@example.com", code: "123456" });
    mocks.get.mockReturnValue({ value: token });
  }

  it("accepts a freshly encrypted code and consumes its cookie", async () => {
    await setCodeCookie();
    expect(await authorize("123456")).toEqual({ id: "test@example.com", email: "test@example.com" });
    expect(mocks.delete).toHaveBeenCalledWith(emailAuthCookies.otp);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("rejects bot verification failures before reading or consuming the code cookie", async () => {
    mocks.captcha.mockResolvedValue(new Response(null, { status: 400 }));
    expect(await authorize("123456")).toBeNull();
    expect(mocks.get).not.toHaveBeenCalled();
    expect(mocks.delete).not.toHaveBeenCalled();
    expect(mocks.access).not.toHaveBeenCalled();
  });

  it("identifies a missing cookie without logging credentials", async () => {
    expect(await authorize("123456")).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("missing verification cookie"));
    expect(mocks.access).not.toHaveBeenCalled();
  });

  it("identifies a mismatched code without logging its value", async () => {
    await setCodeCookie();
    expect(await authorize("654321")).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("code mismatch"));
    expect(mocks.delete).not.toHaveBeenCalled();
  });

  it("rejects an expired token with its diagnostic category", async () => {
    await setCodeCookie();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.now() + 11 * 60_000);
    expect(await authorize("123456")).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(expect.any(String), "ERR_JWT_EXPIRED");
  });

  it("rejects a token encrypted with a different secret", async () => {
    await setCodeCookie();
    vi.stubEnv("AUTH_SECRET", "different-test-only-secret");
    expect(await authorize("123456")).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(expect.any(String), "ERR_JWE_DECRYPTION_FAILED");
  });

  it("rejects an email without login access", async () => {
    await setCodeCookie();
    mocks.access.mockResolvedValue(false);
    expect(await authorize("123456")).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("login access check failed"));
  });

  it("rejects further guesses once a code has used up its attempts", async () => {
    await setCodeCookie();
    mocks.rateLimit
      .mockResolvedValueOnce({ allowed: true, retryAfterSeconds: 0 })
      .mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 300 });
    expect(await authorize("123456")).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("too many attempts for this code"));
    expect(mocks.delete).not.toHaveBeenCalled();
  });

  it("rejects clients that exceed the per-IP limit before reading the cookie", async () => {
    mocks.rateLimit.mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 30 });
    expect(await authorize("123456")).toBeNull();
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it("does not disguise cookie mutation failures as invalid credentials", async () => {
    await setCodeCookie();
    mocks.delete.mockImplementation(() => { throw new Error("Cookie mutation failed"); });
    await expect(authorize("123456")).rejects.toThrow("Cookie mutation failed");
  });
});
