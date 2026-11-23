import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteUrl, normalizeOrigin, publicOrigin } from "@/lib/site-url";

describe("normalizeOrigin", () => {
  it("adds https:// when the scheme is missing", () => {
    expect(normalizeOrigin("redi.healthcare")).toBe("https://redi.healthcare");
    expect(normalizeOrigin(" www.redi.healthcare/ ")).toBe("https://www.redi.healthcare");
  });

  it("keeps only the origin", () => {
    expect(normalizeOrigin("https://redi.healthcare/ro/")).toBe("https://redi.healthcare");
    expect(normalizeOrigin("http://localhost:3000")).toBe("http://localhost:3000");
  });

  it("rejects empty and non-web values", () => {
    expect(normalizeOrigin(undefined)).toBeUndefined();
    expect(normalizeOrigin("   ")).toBeUndefined();
    expect(normalizeOrigin("ftp://redi.healthcare")).toBeUndefined();
    expect(normalizeOrigin("https://")).toBeUndefined();
  });
});

describe("publicOrigin", () => {
  it("drops loopback addresses", () => {
    expect(publicOrigin("http://localhost:3000")).toBeUndefined();
    expect(publicOrigin("127.0.0.1:3000")).toBeUndefined();
    expect(publicOrigin("redi.healthcare")).toBe("https://redi.healthcare");
  });
});

describe("getSiteUrl", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("never throws on a value without a scheme", () => {
    vi.stubEnv("APP_URL", "");
    vi.stubEnv("AUTH_URL", "redi.healthcare");
    expect(getSiteUrl()).toBe("https://redi.healthcare");
    expect(() => new URL(getSiteUrl())).not.toThrow();
  });

  it("falls back when nothing usable is set", () => {
    vi.stubEnv("APP_URL", "not a url at all");
    vi.stubEnv("AUTH_URL", "http://localhost:3000");
    expect(getSiteUrl()).toBe("https://redi.healthcare");
  });
});
