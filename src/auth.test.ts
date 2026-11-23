import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextAuthConfig } from "next-auth";
import type { CredentialsConfig } from "next-auth/providers/credentials";
import { decryptEmailCode, encryptEmailCode, emailAuthCookies, isMatchingOneTimeCode } from "@/lib/email-auth";

const mocks = vi.hoisted(() => ({
  config: vi.fn<(config: NextAuthConfig) => void>(),
  get: vi.fn(),
  delete: vi.fn(),
  access: vi.fn(),
  checkAccess: vi.fn(),
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
  checkLoginAccess: mocks.checkAccess,
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
    mocks.checkAccess.mockReset().mockResolvedValue({ allowed: true });
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

  it("embeds a unique jti in every OTP JWE and rejects server-side replay", async () => {
    const token1 = await encryptEmailCode({ email: "test@example.com", code: "123456" });
    const token2 = await encryptEmailCode({ email: "test@example.com", code: "123456" });
    const decoded1 = await decryptEmailCode(token1);
    const decoded2 = await decryptEmailCode(token2);
    expect(decoded1.jti).toBeTruthy();
    expect(decoded2.jti).toBeTruthy();
    expect(decoded1.jti).not.toBe(decoded2.jti);

    mocks.get.mockReturnValue({ value: token1 });
    mocks.rateLimit
      .mockResolvedValueOnce({ allowed: true, retryAfterSeconds: 0 }) // IP limit
      .mockResolvedValueOnce({ allowed: true, retryAfterSeconds: 0 }) // token attempts
      .mockResolvedValueOnce({ allowed: true, retryAfterSeconds: 0 }) // first jti use
      .mockResolvedValueOnce({ allowed: true, retryAfterSeconds: 0 }) // IP limit (replay)
      .mockResolvedValueOnce({ allowed: true, retryAfterSeconds: 0 }) // token attempts (replay)
      .mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 900 }); // replayed jti rejected

    expect(await authorize("123456")).toEqual({ id: "test@example.com", email: "test@example.com" });
    expect(mocks.rateLimit).toHaveBeenCalledWith(`email-otp-used:${decoded1.jti}`, {
      limit: 1,
      windowMs: 15 * 60_000,
    });

    expect(await authorize("123456")).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("already been used"));
  });

  it("compares OTP codes in constant time across equal and unequal lengths", () => {
    expect(isMatchingOneTimeCode("123456", "123456")).toBe(true);
    expect(isMatchingOneTimeCode("123456", "123457")).toBe(false);
    expect(isMatchingOneTimeCode("123456", "12345")).toBe(false);
    expect(isMatchingOneTimeCode("123456", "")).toBe(false);
  });
});

describe("OAuth verification and session lifetime", () => {
  beforeEach(() => {
    mocks.get.mockReset();
    mocks.checkAccess.mockReset().mockResolvedValue({ allowed: true });
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("configures a 12-hour JWT session with 30-minute sliding updates", () => {
    expect(config.session).toEqual({
      strategy: "jwt",
      maxAge: 12 * 60 * 60,
      updateAge: 30 * 60,
    });
  });

  it("rejects Google OAuth sign-ins unless profile.email_verified is strictly true", async () => {
    const signIn = config.callbacks?.signIn;
    expect(signIn).toBeTypeOf("function");

    const unverified = await signIn!({
      user: { email: "doctor@example.com" },
      account: { provider: "google", type: "oidc", providerAccountId: "g-1" },
      profile: { email: "doctor@example.com", email_verified: false },
    });
    expect(unverified).toBe("/en/sign-in?error=unauthorized-email");
    expect(mocks.checkAccess).not.toHaveBeenCalled();

    const missingFlag = await signIn!({
      user: { email: "doctor@example.com" },
      account: { provider: "google", type: "oidc", providerAccountId: "g-2" },
      profile: { email: "doctor@example.com" },
    });
    expect(missingFlag).toBe("/en/sign-in?error=unauthorized-email");
    expect(mocks.checkAccess).not.toHaveBeenCalled();

    const verified = await signIn!({
      user: { email: "doctor@example.com" },
      account: { provider: "google", type: "oidc", providerAccountId: "g-3" },
      profile: { email: "doctor@example.com", email_verified: true },
    });
    expect(verified).toBe(true);
    expect(mocks.checkAccess).toHaveBeenCalledWith("doctor@example.com");
  });
});

describe("admin-password credentials", () => {
  const adminProvider = config.providers.find(
    (item) => typeof item !== "function" && item.type === "credentials" && item.id === "admin-password",
  ) as CredentialsConfig;

  function authorizeAdmin(email: string, password: string) {
    return adminProvider.authorize(
      { email, password },
      new Request("http://localhost/api/auth/callback/admin-password"),
    );
  }

  beforeEach(() => {
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
    vi.stubEnv("ADMIN_PASSWORD", "SecretPass1!");
    mocks.rateLimit.mockReset().mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.captcha.mockReset().mockResolvedValue(null);
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("accepts matching admin email (case-insensitive) and exact password", async () => {
    expect(await authorizeAdmin("  ADMIN@Example.com ", "SecretPass1!")).toEqual({
      id: "admin@example.com",
      email: "admin@example.com",
      name: "Super Admin",
    });
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("rejects wrong passwords or unknown emails without logging secrets", async () => {
    expect(await authorizeAdmin("admin@example.com", "wrong")).toBeNull();
    expect(await authorizeAdmin("other@example.com", "SecretPass1!")).toBeNull();
    for (const call of vi.mocked(console.warn).mock.calls) {
      expect(JSON.stringify(call)).not.toContain("SecretPass1!");
      expect(JSON.stringify(call)).not.toContain("wrong");
    }
  });

  it("rejects when ADMIN_EMAIL or ADMIN_PASSWORD is not configured", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect(await authorizeAdmin("admin@example.com", "SecretPass1!")).toBeNull();
  });

  it("enforces bot verification and rate limits before checking credentials", async () => {
    mocks.captcha.mockResolvedValue(new Response(null, { status: 400 }));
    expect(await authorizeAdmin("admin@example.com", "SecretPass1!")).toBeNull();

    mocks.captcha.mockResolvedValue(null);
    mocks.rateLimit.mockResolvedValueOnce({ allowed: false, retryAfterSeconds: 60 });
    expect(await authorizeAdmin("admin@example.com", "SecretPass1!")).toBeNull();
  });
});
