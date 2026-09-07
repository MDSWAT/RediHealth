import { afterEach, describe, expect, it, vi } from "vitest";
import { getClientIp } from "@/lib/rate-limit";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getClientIp", () => {
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