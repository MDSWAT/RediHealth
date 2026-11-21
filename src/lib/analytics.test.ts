import { describe, expect, it } from "vitest";
import type { NextlyticsEvent } from "@nextlytics/core";
import {
  campaignFromSearch,
  cleanPagePath,
  countryFromHeaders,
  isAnalyticsEvent,
  isBot,
  optedOut,
  parseUserAgent,
  referrerHost,
} from "@/lib/analytics";
import { eventToRow, visitorHash } from "@/lib/analytics-server";

const CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1";

function event(overrides: Partial<NextlyticsEvent> & { headers?: Record<string, string>; path?: string; search?: Record<string, string[]> } = {}): NextlyticsEvent {
  const { headers, path, search, ...rest } = overrides;
  return {
    origin: "server",
    collectedAt: new Date().toISOString(),
    eventId: "e1",
    type: "pageView",
    anonymousUserId: "a".repeat(32),
    serverContext: {
      collectedAt: new Date(),
      host: "redi.healthcare",
      method: "GET",
      path: path ?? "/ro/find-help",
      search: search ?? {},
      ip: "203.0.113.9",
      requestHeaders: { "user-agent": CHROME, "x-forwarded-for": "203.0.113.9", "x-vercel-ip-country": "RO", "x-vercel-ip-city": "Iasi", ...headers },
      responseHeaders: {},
    },
    properties: {},
    ...rest,
  };
}

describe("cleanPagePath", () => {
  it("removes the language prefix and keeps it separately", () => {
    expect(cleanPagePath("/ro/find-help")).toEqual({ path: "/find-help", lang: "ro" });
    expect(cleanPagePath("/en")).toEqual({ path: "/", lang: "en" });
    expect(cleanPagePath("/it/health-info/")).toEqual({ path: "/health-info", lang: "it" });
  });

  it("never counts staff, sign-in, account, triage-note, portal or API pages", () => {
    for (const path of ["/ro/panel", "/en/panel/patients/12", "/offline", "/ro/sign-in", "/contul-meu", "/ro/health-check/note", "/ro/patient-portal/s3cr3t-token", "/api/event"]) {
      expect(cleanPagePath(path)).toBeNull();
    }
  });

  it("ignores static files, Next.js internals and query strings", () => {
    expect(cleanPagePath("/_next/static/chunk.js")).toBeNull();
    expect(cleanPagePath("/logo.png")).toBeNull();
    expect(cleanPagePath("/ro/find-help?name=Ana")).toEqual({ path: "/find-help", lang: "ro" });
  });
});

describe("campaign, referrer and device", () => {
  it("keeps only utm_* tags, lower-cased and shortened", () => {
    expect(campaignFromSearch("?utm_source=Facebook&utm_campaign=Launch&name=Ana&email=a%40b.c")).toEqual({
      utm_source: "facebook",
      utm_campaign: "launch",
    });
    expect(campaignFromSearch(`?utm_term=${"x".repeat(300)}`).utm_term).toHaveLength(100);
  });

  it("keeps only the host of external referrers", () => {
    expect(referrerHost("https://www.google.com/search?q=my+diagnosis", "redi.healthcare")).toBe("google.com");
    expect(referrerHost("https://redi.healthcare/ro/about", "redi.healthcare")).toBeNull();
    expect(referrerHost("android-app://com.facebook", "redi.healthcare")).toBeNull();
    expect(referrerHost(null, "redi.healthcare")).toBeNull();
  });

  it("detects bots, opt-outs, country and device families", () => {
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
    expect(isBot("")).toBe(true);
    expect(isBot(CHROME)).toBe(false);
    expect(optedOut(new Headers({ dnt: "1" }))).toBe(true);
    expect(optedOut(new Headers({ "sec-gpc": "1" }))).toBe(true);
    expect(optedOut(new Headers())).toBe(false);
    expect(countryFromHeaders(new Headers({ "x-vercel-ip-country": "ro" }))).toBe("RO");
    expect(countryFromHeaders(new Headers({ "cf-ipcountry": "XX" }))).toBeNull();
    expect(parseUserAgent(CHROME)).toEqual({ device: "desktop", browser: "Chrome", os: "Windows" });
    expect(parseUserAgent(IPHONE)).toEqual({ device: "mobile", browser: "Safari", os: "iOS" });
  });

  it("accepts only the known conversion events", () => {
    expect(isAnalyticsEvent("help_request_sent")).toBe(true);
    expect(isAnalyticsEvent("anything_else")).toBe(false);
  });
});

describe("visitorHash", () => {
  it("is stable within a day, changes the next day and does not contain the IP", () => {
    const day = new Date("2026-11-20T10:00:00Z");
    const sameDay = new Date("2026-11-20T23:00:00Z");
    const nextDay = new Date("2026-11-21T01:00:00Z");
    const hash = visitorHash("203.0.113.9", CHROME, "redi.healthcare", day);
    expect(hash).toMatch(/^[0-9a-f]{32}$/);
    expect(visitorHash("203.0.113.9", CHROME, "redi.healthcare", sameDay)).toBe(hash);
    expect(visitorHash("203.0.113.9", CHROME, "redi.healthcare", nextDay)).not.toBe(hash);
    expect(visitorHash("203.0.113.10", CHROME, "redi.healthcare", day)).not.toBe(hash);
  });
});

describe("eventToRow (Nextlytics backend)", () => {
  it("stores only the cleaned fields: no IP, city, headers or user agent", () => {
    const row = eventToRow(
      event({ headers: { referer: "https://www.facebook.com/ads?fbclid=123" }, search: { utm_source: ["Facebook"], fbclid: ["123"] } }),
    );
    expect(row).toEqual({
      kind: "pageview",
      event_name: null,
      path: "/find-help",
      lang: "ro",
      referrer_host: "facebook.com",
      utm_source: "facebook",
      country: "RO",
      device: "desktop",
      browser: "Chrome",
      os: "Windows",
      visitor_hash: "a".repeat(32),
    });
    const stored = JSON.stringify(row);
    expect(stored).not.toContain("203.0.113.9");
    expect(stored).not.toContain("Iasi");
    expect(stored).not.toContain("fbclid");
    expect(stored).not.toContain("Mozilla");
  });

  it("skips private pages, bots, opted-out browsers and unknown event types", () => {
    expect(eventToRow(event({ path: "/ro/panel/patients" }))).toBeNull();
    expect(eventToRow(event({ path: "/ro/patient-portal/abc" }))).toBeNull();
    expect(eventToRow(event({ headers: { "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)" } }))).toBeNull();
    expect(eventToRow(event({ headers: { dnt: "1" } }))).toBeNull();
    expect(eventToRow(event({ type: "apiCall" }))).toBeNull();
    expect(eventToRow(event({ type: "signup" }))).toBeNull();
  });

  it("records conversion events and client-side navigations without a referrer", () => {
    expect(eventToRow(event({ type: "help_request_sent", origin: "client" }))).toMatchObject({ kind: "event", event_name: "help_request_sent" });
    const navigation = eventToRow(
      event({
        origin: "client",
        headers: { referer: "https://www.google.com/" },
        clientContext: { collectedAt: new Date(), path: "/en/about", screen: {} },
      }),
    );
    expect(navigation).toMatchObject({ kind: "pageview", path: "/about", lang: "en", referrer_host: null });
  });
});
