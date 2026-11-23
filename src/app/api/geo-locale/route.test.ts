import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getGeoLocale } from "@/app/api/geo-locale/route";
import { POST as postGeoIp } from "@/app/api/geo-ip/route";
import { _resetRateLimitMemoryForTest } from "@/lib/rate-limit";

describe("GET /api/geo-locale and POST /api/geo-ip hardening", () => {
  beforeEach(() => {
    _resetRateLimitMemoryForTest();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("ignores spoofed X-Forwarded-For on /api/geo-locale when proxy headers are not trusted", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const res = await getGeoLocale(
      new Request("https://redihealth.org/api/geo-locale", {
        headers: { "x-forwarded-for": "86.120.10.5" },
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ country: null, lang: null, source: "none" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("uses trusted client IP and enforces rate limits on /api/geo-locale", async () => {
    vi.stubEnv("REDIHEALTH_TRUST_PROXY_HEADERS", "true");
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ country: "RO" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchSpy);

    const okRes = await getGeoLocale(
      new Request("https://redihealth.org/api/geo-locale", {
        headers: { "x-forwarded-for": "1.2.3.4, 86.120.10.5, 10.0.0.1" },
      }),
    );
    expect(okRes.status).toBe(200);
    expect(await okRes.json()).toEqual({ country: "RO", lang: "ro", source: "geoip" });
    expect(fetchSpy).toHaveBeenCalledWith("https://api.country.is/86.120.10.5", expect.any(Object));

    for (let i = 0; i < 29; i += 1) {
      const r = await getGeoLocale(
        new Request("https://redihealth.org/api/geo-locale", {
          headers: { "x-real-ip": "86.120.10.5", "cf-ipcountry": "RO" },
        }),
      );
      expect(r.status).toBe(200);
    }

    const limited = await getGeoLocale(
      new Request("https://redihealth.org/api/geo-locale", {
        headers: { "x-real-ip": "86.120.10.5", "cf-ipcountry": "RO" },
      }),
    );
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBeTruthy();
  });

  it("returns 400 on malformed or non-object JSON in POST /api/geo-ip and sets Secure cookie in production", async () => {
    for (const rawBody of ["{invalid json", "null", "[]", "\"Bucharest\""]) {
      const badReq = new NextRequest("https://redihealth.org/api/geo-ip", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: rawBody,
      });
      const res = await postGeoIp(badReq);
      expect(res.status, rawBody).toBe(400);
    }

    vi.stubEnv("NODE_ENV", "production");
    const goodReq = new NextRequest("https://redihealth.org/api/geo-ip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ county: "Cluj" }),
    });
    const goodRes = await postGeoIp(goodReq);
    expect(goodRes.status).toBe(200);
    const setCookie = goodRes.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("redi_user_county=Cluj");
    expect(setCookie.toLowerCase()).toContain("secure");
  });
});
