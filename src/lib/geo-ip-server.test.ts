import { describe, expect, it } from "vitest";
import {
  DEFAULT_COUNTY,
  USER_COUNTY_COOKIE,
  USER_COUNTY_HEADER,
  resolveCountyFromHeaders,
} from "@/lib/geo-ip-server";

describe("resolveCountyFromHeaders", () => {
  it("resolves a valid percent-encoded county cookie", () => {
    const cookie = `other=1; ${USER_COUNTY_COOKIE}=${encodeURIComponent("Cluj")}`;
    expect(resolveCountyFromHeaders(new Headers(), cookie)).toBe("Cluj");

    const diacriticCookie = `${USER_COUNTY_COOKIE}=${encodeURIComponent("Brașov")}`;
    expect(resolveCountyFromHeaders(new Headers(), diacriticCookie)).toBe("Brașov");
  });

  it("falls back to DEFAULT_COUNTY instead of throwing on malformed percent-encoding", () => {
    expect(() =>
      resolveCountyFromHeaders(new Headers(), `${USER_COUNTY_COOKIE}=%E0%A4%A`),
    ).not.toThrow();
    expect(
      resolveCountyFromHeaders(new Headers(), `${USER_COUNTY_COOKIE}=%E0%A4%A`),
    ).toBe(DEFAULT_COUNTY);
    expect(
      resolveCountyFromHeaders(new Headers(), `${USER_COUNTY_COOKIE}=%ZZ`),
    ).toBe(DEFAULT_COUNTY);
  });

  it("resolves from CDN region headers and forwarded headers when cookie is absent or invalid", () => {
    const regionHeaders = new Headers({ "x-vercel-ip-country-region": "RO-IS" });
    expect(resolveCountyFromHeaders(regionHeaders)).toBe("Iași");

    const forwardedHeaders = new Headers({ [USER_COUNTY_HEADER]: encodeURIComponent("Timiș") });
    expect(resolveCountyFromHeaders(forwardedHeaders)).toBe("Timiș");
  });
});
