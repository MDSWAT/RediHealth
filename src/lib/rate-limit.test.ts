import { afterEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("checkRateLimit", () => {
  it("allows requests up to the limit, then reports how long to wait", async () => {
    const options = { limit: 2, windowMs: 60_000 };
    expect((await checkRateLimit("test:limit", options)).allowed).toBe(true);
    expect((await checkRateLimit("test:limit", options)).allowed).toBe(true);

    const blocked = await checkRateLimit("test:limit", options);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks keys independently and resets after the window", async () => {
    vi.useFakeTimers();
    try {
      const options = { limit: 1, windowMs: 1_000 };
      expect((await checkRateLimit("test:a", options)).allowed).toBe(true);
      expect((await checkRateLimit("test:b", options)).allowed).toBe(true);
      expect((await checkRateLimit("test:a", options)).allowed).toBe(false);

      vi.advanceTimersByTime(1_001);
      expect((await checkRateLimit("test:a", options)).allowed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("getClientIp", () => {
  it("trusts forwarded headers on Vercel, which overwrites them", () => {
    vi.stubEnv("VERCEL", "1");

    const request = new Request("http://localhost/test", {
      headers: { "x-forwarded-for": "198.51.100.10" },
    });

    expect(getClientIp(request)).toBe("198.51.100.10");
  });

  it("does not trust spoofable proxy headers by default", () => {
    const request = new Request("http://localhost/test", {
      headers: {
        "x-forwarded-for": "198.51.100.10",
        "x-real-ip": "198.51.100.11",
      },
    });

    expect(getClientIp(request)).toBe("unknown");
  });

  it("uses the first forwarded IP when proxy header trust is explicitly enabled", () => {
    vi.stubEnv("REDIHEALTH_TRUST_PROXY_HEADERS", "true");

    const request = new Request("http://localhost/test", {
      headers: {
        "x-forwarded-for": "198.51.100.10, 203.0.113.20",
      },
    });

    expect(getClientIp(request)).toBe("198.51.100.10");
  });
});