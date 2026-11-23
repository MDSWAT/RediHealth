import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  configuredCountries: vi.fn(() => ["RO", "IT"]),
  checkRateLimit: vi.fn(),
}));

vi.mock("@/lib/database", () => ({
  getCountryDatabase: () => ({ query: mocks.query }),
  configuredCountries: mocks.configuredCountries,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mocks.checkRateLimit,
  getClientIp: () => "127.0.0.1",
}));

import { POST as requestOtpPost } from "./request-phone-otp/route";
import { POST as verifyOtpPost } from "./verify-phone-otp/route";
import { PHONE_OTP_COOKIE, otpStore } from "@/lib/security/portal-otp-store";

function makeJsonRequest(url: string, body: unknown, cookie?: string): Request {
  return new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

function extractCookiePair(response: Response, name: string): string {
  const setCookie = response.headers.get("set-cookie") ?? "";
  const match = setCookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? `${name}=${match[1]}` : "";
}

describe("patient portal SMS phone OTP flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ENABLE_LOCAL_DEMO_OTP", "true");
    otpStore.clear();
    mocks.configuredCountries.mockReturnValue(["RO", "IT"]);
    mocks.checkRateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.query.mockResolvedValue([[]]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("stores OTP on globalThis and attaches an HttpOnly encrypted cookie on request", async () => {
    const response = await requestOtpPost(
      makeJsonRequest("https://redihealth.local/api/patient-portal/request-phone-otp", {
        phone: "0721 123 456",
      }),
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as { success: boolean; demoCode: string };
    expect(data.success).toBe(true);
    expect(data.demoCode).toMatch(/^\d{4}$/);

    const stored = otpStore.get("0721123456");
    expect(stored?.otp).toBe(data.demoCode);
    expect((globalThis as { redihealthPhoneOtpStore?: unknown }).redihealthPhoneOtpStore).toBe(otpStore);

    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain(`${PHONE_OTP_COOKIE}=`);
    expect(setCookie.toLowerCase()).toContain("httponly");
  });

  it("verifies via encrypted cookie across isolated route chunks, issues portal token, and blocks replay", async () => {
    const reqRes = await requestOtpPost(
      makeJsonRequest("https://redihealth.local/api/patient-portal/request-phone-otp", {
        phone: "0721 123 456",
      }),
    );
    const { demoCode } = (await reqRes.json()) as { demoCode: string };
    const cookieHeader = extractCookiePair(reqRes, PHONE_OTP_COOKIE);
    expect(cookieHeader).not.toBe("");

    // Simulate verify route running in a different Next.js module chunk where memory store is empty.
    otpStore.clear();

    mocks.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ id: 42 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const verifyRes = await verifyOtpPost(
      makeJsonRequest(
        "https://redihealth.local/api/patient-portal/verify-phone-otp",
        { phone: "0721123456", otp: demoCode },
        cookieHeader,
      ),
    );

    expect(verifyRes.status).toBe(200);
    const verifyData = (await verifyRes.json()) as { success: boolean; redirectUrl: string };
    expect(verifyData.success).toBe(true);
    expect(verifyData.redirectUrl).toMatch(/^\/patient-portal\/.+\?c=it$/);
    expect(mocks.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(phone, '')"),
      ["%721123456"],
    );
    expect(mocks.query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("UPDATE patients"),
      [expect.any(String), 42],
    );
    expect(verifyRes.headers.get("set-cookie")?.toLowerCase()).toContain("max-age=0");

    // Replaying the same cookie against an already-consumed code must fail.
    const replayRes = await verifyOtpPost(
      makeJsonRequest(
        "https://redihealth.local/api/patient-portal/verify-phone-otp",
        { phone: "0721123456", otp: demoCode },
        cookieHeader,
      ),
    );
    expect(replayRes.status).toBe(400);
    expect(await replayRes.json()).toMatchObject({ code: "invalid_code" });
  });

  it("returns 404 no_patient_record and clears the cookie when no patient owns the phone", async () => {
    const reqRes = await requestOtpPost(
      makeJsonRequest("https://redihealth.local/api/patient-portal/request-phone-otp", {
        phone: "0733315375",
      }),
    );
    const { demoCode } = (await reqRes.json()) as { demoCode: string };
    const cookieHeader = extractCookiePair(reqRes, PHONE_OTP_COOKIE);

    mocks.query.mockResolvedValue([[]]);

    const verifyRes = await verifyOtpPost(
      makeJsonRequest(
        "https://redihealth.local/api/patient-portal/verify-phone-otp",
        { phone: "0733315375", otp: demoCode },
        cookieHeader,
      ),
    );

    expect(verifyRes.status).toBe(404);
    expect(await verifyRes.json()).toMatchObject({ code: "no_patient_record" });
    expect(verifyRes.headers.get("set-cookie")?.toLowerCase()).toContain("max-age=0");
  });

  it("returns 409 shared_phone and clears the cookie when multiple patients share a phone", async () => {
    const reqRes = await requestOtpPost(
      makeJsonRequest("https://redihealth.local/api/patient-portal/request-phone-otp", {
        phone: "0721000000",
      }),
    );
    const { demoCode } = (await reqRes.json()) as { demoCode: string };
    const cookieHeader = extractCookiePair(reqRes, PHONE_OTP_COOKIE);

    mocks.query.mockResolvedValueOnce([[{ id: 1 }, { id: 2 }]]).mockResolvedValueOnce([[]]);

    const verifyRes = await verifyOtpPost(
      makeJsonRequest(
        "https://redihealth.local/api/patient-portal/verify-phone-otp",
        { phone: "0721000000", otp: demoCode },
        cookieHeader,
      ),
    );

    expect(verifyRes.status).toBe(409);
    expect(await verifyRes.json()).toMatchObject({ code: "shared_phone" });
    expect(verifyRes.headers.get("set-cookie")?.toLowerCase()).toContain("max-age=0");
  });

  it("returns 400 invalid_code when the code does not match", async () => {
    const reqRes = await requestOtpPost(
      makeJsonRequest("https://redihealth.local/api/patient-portal/request-phone-otp", {
        phone: "0721000000",
      }),
    );
    const { demoCode } = (await reqRes.json()) as { demoCode: string };
    const wrongCode = demoCode === "0000" ? "9999" : "0000";

    const verifyRes = await verifyOtpPost(
      makeJsonRequest("https://redihealth.local/api/patient-portal/verify-phone-otp", {
        phone: "0721000000",
        otp: wrongCode,
      }),
    );

    expect(verifyRes.status).toBe(400);
    expect(await verifyRes.json()).toMatchObject({ code: "invalid_code" });
  });

  it("returns 503 service_unavailable without consuming OTP when country databases fail", async () => {
    const reqRes = await requestOtpPost(
      makeJsonRequest("https://redihealth.local/api/patient-portal/request-phone-otp", {
        phone: "0721000000",
      }),
    );
    const { demoCode } = (await reqRes.json()) as { demoCode: string };

    mocks.query.mockRejectedValue(new Error("ECONNREFUSED"));

    const failRes = await verifyOtpPost(
      makeJsonRequest("https://redihealth.local/api/patient-portal/verify-phone-otp", {
        phone: "0721000000",
        otp: demoCode,
      }),
    );
    expect(failRes.status).toBe(503);
    expect(await failRes.json()).toMatchObject({ code: "service_unavailable" });
    expect(otpStore.get("0721000000")?.consumed).toBeUndefined();

    // OTP stays usable once database connectivity recovers.
    mocks.query
      .mockResolvedValueOnce([[{ id: 7 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const okRes = await verifyOtpPost(
      makeJsonRequest("https://redihealth.local/api/patient-portal/verify-phone-otp", {
        phone: "0721000000",
        otp: demoCode,
      }),
    );
    expect(okRes.status).toBe(200);
  });

  it("disables phone OTP demo endpoints unless ENABLE_LOCAL_DEMO_OTP=true in development", async () => {
    for (const [env, flag] of [
      ["production", "true"],
      ["development", "false"],
      ["development", ""],
      ["test", "true"],
    ] as const) {
      vi.stubEnv("NODE_ENV", env);
      vi.stubEnv("ENABLE_LOCAL_DEMO_OTP", flag);

      const reqRes = await requestOtpPost(
        makeJsonRequest("https://redihealth.local/api/patient-portal/request-phone-otp", {
          phone: "0721000000",
        }),
      );
      expect(reqRes.status).toBe(503);
      expect(await reqRes.json()).toMatchObject({ code: "sms_unavailable" });

      const verifyRes = await verifyOtpPost(
        makeJsonRequest("https://redihealth.local/api/patient-portal/verify-phone-otp", {
          phone: "0721000000",
          otp: "1234",
        }),
      );
      expect(verifyRes.status).toBe(503);
      expect(await verifyRes.json()).toMatchObject({ code: "sms_unavailable" });
    }
  });

  it("prevents concurrent TOCTOU verification replays from double-rotating the portal token", async () => {
    const reqRes = await requestOtpPost(
      makeJsonRequest("https://redihealth.local/api/patient-portal/request-phone-otp", {
        phone: "0721000000",
      }),
    );
    const { demoCode } = (await reqRes.json()) as { demoCode: string };

    let releaseSelect!: () => void;
    const selectGate = new Promise<void>((resolve) => {
      releaseSelect = resolve;
    });

    mocks.query
      .mockImplementationOnce(async () => {
        await selectGate;
        return [[{ id: 99 }]];
      })
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const first = verifyOtpPost(
      makeJsonRequest("https://redihealth.local/api/patient-portal/verify-phone-otp", {
        phone: "0721000000",
        otp: demoCode,
      }),
    );
    const second = verifyOtpPost(
      makeJsonRequest("https://redihealth.local/api/patient-portal/verify-phone-otp", {
        phone: "0721000000",
        otp: demoCode,
      }),
    );

    // Let both reach rate-limit / store check before releasing the DB query.
    await new Promise((r) => setTimeout(r, 10));
    releaseSelect();

    const [res1, res2] = await Promise.all([first, second]);
    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([200, 400]);
    expect(mocks.query).toHaveBeenCalledTimes(2); // 1 SELECT + 1 UPDATE only
  });
});