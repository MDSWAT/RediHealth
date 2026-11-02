import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { verifyRecaptcha } from "./recaptcha";

const fetchMock = vi.fn();

function validResult() {
  return {
    success: true,
    score: 0.9,
    action: "help_request",
    hostname: "redihealth.org",
    challenge_ts: new Date().toISOString(),
  };
}

describe("reCAPTCHA server verification", () => {
  beforeEach(() => {
    vi.stubEnv("RECAPTCHA_ENABLED", "true");
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "test-secret");
    vi.stubEnv("RECAPTCHA_ALLOWED_HOSTNAMES", "redihealth.org,www.redihealth.org");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset().mockResolvedValue(Response.json(validResult()));
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("accepts a fresh action-bound token from an allowed hostname", async () => {
    expect(await verifyRecaptcha("captcha-token", "help_request")).toBeNull();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://www.google.com/recaptcha/api/siteverify");
    expect(options.method).toBe("POST");
    expect(options.body.get("secret")).toBe("test-secret");
    expect(options.body.get("response")).toBe("captcha-token");
    expect([...options.body.keys()]).toEqual(["secret", "response"]);
    expect(options.cache).toBe("no-store");
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it.each(["false", ""])("does not require a token or contact Google when disabled (%j)", async (enabled) => {
    vi.stubEnv("RECAPTCHA_ENABLED", enabled);
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "");
    vi.stubEnv("RECAPTCHA_ALLOWED_HOSTNAMES", "");
    expect(await verifyRecaptcha(undefined, "help_request")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts the exact minimum score of 0.5", async () => {
    fetchMock.mockResolvedValue(Response.json({ ...validResult(), score: 0.5 }));
    expect(await verifyRecaptcha("captcha-token", "help_request")).toBeNull();
  });

  it.each([undefined, null, "", " ", 42, {}, "x".repeat(4097)])("rejects malformed or missing tokens without calling Google: %j", async (token) => {
    expect((await verifyRecaptcha(token, "help_request"))?.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    { success: false },
    { score: 0.49 },
    { score: 1.1 },
    { score: "0.9" },
    { score: null },
    { action: "email_code" },
    { hostname: "attacker.example" },
    { hostname: "redihealth.org.attacker.example" },
    { challenge_ts: "invalid" },
    { challenge_ts: new Date(Date.now() - 121_000).toISOString() },
    { challenge_ts: new Date(Date.now() + 60_000).toISOString() },
  ])("rejects invalid provider verification: %j", async (overrides) => {
    fetchMock.mockResolvedValue(Response.json({ ...validResult(), ...overrides }));
    const response = await verifyRecaptcha("captcha-token", "help_request");
    expect(response?.status).toBe(400);
    expect(await response?.json()).toMatchObject({ code: "captcha_invalid" });
  });

  it.each(["RECAPTCHA_SECRET_KEY", "RECAPTCHA_ALLOWED_HOSTNAMES"])("fails closed when %s is missing", async (key) => {
    vi.stubEnv(key, "");
    const response = await verifyRecaptcha("captcha-token", "help_request");
    expect(response?.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails closed on network errors", async () => {
    fetchMock.mockRejectedValue(new Error("network unavailable"));
    expect((await verifyRecaptcha("captcha-token", "help_request"))?.status).toBe(503);
  });

  it("fails closed on HTTP errors", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 503 }));
    expect((await verifyRecaptcha("captcha-token", "help_request"))?.status).toBe(503);
  });

  it("fails closed on malformed JSON responses", async () => {
    fetchMock.mockResolvedValue(new Response("not JSON"));
    expect((await verifyRecaptcha("captcha-token", "help_request"))?.status).toBe(503);
  });
});
