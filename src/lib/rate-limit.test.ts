import { afterEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  hasControlDatabase: vi.fn(() => false),
  query: vi.fn(),
}));

vi.mock("@/lib/database", () => ({
  hasControlDatabase: dbMocks.hasControlDatabase,
  getControlDatabase: () => ({ query: dbMocks.query }),
}));

import {
  _getRateLimitMemorySizeForTest,
  _resetRateLimitMemoryForTest,
  checkRateLimit,
  getClientIp,
} from "@/lib/rate-limit";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  dbMocks.hasControlDatabase.mockReturnValue(false);
  _resetRateLimitMemoryForTest();
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

  it("supports weighted cost consumption for character/token budgets", async () => {
    const options = { limit: 100, windowMs: 60_000 };
    expect((await checkRateLimit("test:cost", { ...options, cost: 60 })).allowed).toBe(true);
    expect((await checkRateLimit("test:cost", { ...options, cost: 40 })).allowed).toBe(true);
    expect((await checkRateLimit("test:cost", { ...options, cost: 1 })).allowed).toBe(false);
  });

  it("caps in-memory buckets at 10,000 entries by evicting oldest entries", async () => {
    const options = { limit: 5, windowMs: 60_000 };
    for (let i = 0; i < 10_050; i += 1) {
      await checkRateLimit(`test:cap:${i}`, options);
    }
    expect(_getRateLimitMemorySizeForTest()).toBeLessThanOrEqual(10_000);
  });

  it("uses a single atomic ON CONFLICT DO UPDATE ... RETURNING query when backed by PostgreSQL", async () => {
    vi.stubEnv("NODE_ENV", "production");
    dbMocks.hasControlDatabase.mockReturnValue(true);
    dbMocks.query.mockResolvedValue([[{ hits: 3, reset_at: Date.now() + 30_000 }], undefined]);

    const result = await checkRateLimit("prod:atomic", { limit: 2, windowMs: 60_000 });
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);

    // Filter out background cleanup DELETE if triggered; verify only 1 rate-limit upsert+RETURNING ran (no separate SELECT).
    const upsertCalls = dbMocks.query.mock.calls.filter(([sql]) => String(sql).includes("INSERT INTO rate_limits"));
    const selectCalls = dbMocks.query.mock.calls.filter(([sql]) => String(sql).trim().startsWith("SELECT "));
    expect(upsertCalls).toHaveLength(1);
    expect(String(upsertCalls[0][0])).toContain("RETURNING hits, reset_at");
    expect(selectCalls).toHaveLength(0);
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

  it("prefers x-real-ip over x-forwarded-for when proxy trust is enabled", () => {
    vi.stubEnv("REDIHEALTH_TRUST_PROXY_HEADERS", "true");

    const request = new Request("http://localhost/test", {
      headers: {
        "x-forwarded-for": "198.51.100.10, 203.0.113.20",
        "x-real-ip": "203.0.113.99",
      },
    });

    expect(getClientIp(request)).toBe("203.0.113.99");
  });

  it("uses the rightmost untrusted hop in X-Forwarded-For to resist leftmost client spoofing", () => {
    vi.stubEnv("REDIHEALTH_TRUST_PROXY_HEADERS", "true");

    const spoofedRequest = new Request("http://localhost/test", {
      headers: {
        "x-forwarded-for": "198.51.100.10, 203.0.113.20",
      },
    });
    expect(getClientIp(spoofedRequest)).toBe("203.0.113.20");

    const internalProxyRequest = new Request("http://localhost/test", {
      headers: {
        "x-forwarded-for": "86.120.10.5, 10.0.0.1",
      },
    });
    expect(getClientIp(internalProxyRequest)).toBe("86.120.10.5");
  });
});