import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse, type NextFetchEvent } from "next/server";
import { GET as getGeoLocale } from "@/app/api/geo-locale/route";
import {
  LOCALE_MANUAL_COOKIE,
  detectClientPreferredLocale,
  detectPreferredLocaleFromRequest,
  hasManualLocaleCookie,
  isAutomatedOrAuditUserAgent,
  langFromAcceptLanguage,
  langFromTimezone,
  timezoneFromHeaders,
} from "@/lib/i18n/locale-detection";
import { LOCALE_COOKIE, REQUEST_LANG_HEADER } from "@/lib/i18n/routing";
import { countryFromHeaders, langForCountry } from "@/lib/medical-institutes";
import { proxy } from "@/proxy";
import { analyticsMiddleware } from "@/nextlytics";

// Nextlytics itself is not run here: the mock answers like its middleware does for a tracked page.
vi.mock("@/nextlytics", () => ({
  ANALYTICS_EVENT_ENDPOINT: "/api/event",
  analyticsMiddleware: vi.fn(async () => {
    const response = NextResponse.next();
    response.headers.set("x-nl-page-render-id", "render-1");
    response.cookies.set("last-page-render-id", "render-1");
    return response;
  }),
}));

function fetchEvent() {
  return { waitUntil: vi.fn() } as unknown as NextFetchEvent & { waitUntil: ReturnType<typeof vi.fn> };
}

function cookieJar(entries: Record<string, string> = {}) {
  return {
    get(name: string) {
      const value = entries[name];
      return value === undefined ? undefined : { value };
    },
  };
}

describe("langFromTimezone & timezoneFromHeaders", () => {
  it("maps target European and Russian-speaking timezones", () => {
    expect(langFromTimezone("Europe/Bucharest")).toBe("ro");
    expect(langFromTimezone("Europe/Chisinau")).toBe("ro");
    expect(langFromTimezone("Europe/Tiraspol")).toBe("ro");
    expect(langFromTimezone("Europe/Tirane")).toBe("sq");
    expect(langFromTimezone("Europe/Rome")).toBe("it");
    expect(langFromTimezone("Europe/Vatican")).toBe("it");
    expect(langFromTimezone("Europe/San_Marino")).toBe("it");
    expect(langFromTimezone("Europe/Zagreb")).toBe("hr");
    expect(langFromTimezone("Europe/Moscow")).toBe("ru");
    expect(langFromTimezone("Europe/Kaliningrad")).toBe("ru");
    expect(langFromTimezone("Europe/Samara")).toBe("ru");
    expect(langFromTimezone("Europe/Yekaterinburg")).toBe("ru");
    expect(langFromTimezone("Europe/Minsk")).toBe("ru");
  });

  it("returns null for unmapped or empty timezones", () => {
    expect(langFromTimezone("Europe/Berlin")).toBeNull();
    expect(langFromTimezone("America/New_York")).toBeNull();
    expect(langFromTimezone("UTC")).toBeNull();
    expect(langFromTimezone("")).toBeNull();
    expect(langFromTimezone(null)).toBeNull();
    expect(langFromTimezone(undefined)).toBeNull();
  });

  it("reads timezone headers in priority order", () => {
    expect(
      timezoneFromHeaders(
        new Headers({
          "x-timezone": "Europe/Rome",
          "cf-timezone": "Europe/Tirane",
          "x-vercel-ip-timezone": "Europe/Bucharest",
        }),
      ),
    ).toBe("Europe/Bucharest");
    expect(timezoneFromHeaders(new Headers({ "cf-timezone": "Europe/Zagreb" }))).toBe("Europe/Zagreb");
    expect(timezoneFromHeaders(new Headers({ "x-timezone": " Europe/Moscow " }))).toBe("Europe/Moscow");
    expect(timezoneFromHeaders(new Headers())).toBeNull();
  });
});

describe("medical-institutes geo header and country expansions", () => {
  it("reads additional CDN country headers while keeping DE unmapped", () => {
    expect(countryFromHeaders(new Headers({ "x-appengine-country": "ro" }))).toBe("RO");
    expect(countryFromHeaders(new Headers({ "x-nf-country-code": "al" }))).toBe("AL");
    expect(countryFromHeaders(new Headers({ "fly-client-country": "it" }))).toBe("IT");
    expect(countryFromHeaders(new Headers({ "fastly-client-country": "hr" }))).toBe("HR");
    expect(countryFromHeaders(new Headers({ "x-appengine-country": "ZZ" }))).toBeNull();

    expect(langForCountry("RU")).toBe("ru");
    expect(langForCountry("BY")).toBe("ru");
    expect(langForCountry("DE")).toBeNull();
  });
});

describe("langFromAcceptLanguage", () => {
  it("parses quality weights, preserves tie order, and maps Romani tags", () => {
    expect(langFromAcceptLanguage("ro-RO,ro;q=0.9,en-US;q=0.8")).toBe("ro");
    expect(langFromAcceptLanguage("en-US;q=0.7,sq-AL;q=0.9")).toBe("sq");
    expect(langFromAcceptLanguage("rmy-RO,en;q=0.8")).toBe("rom");
    expect(langFromAcceptLanguage("rom,en;q=0.8")).toBe("rom");
    expect(langFromAcceptLanguage("de-DE,fr-FR;q=0.9")).toBeNull();
    expect(langFromAcceptLanguage("ro;q=0")).toBeNull();
    expect(langFromAcceptLanguage(null)).toBeNull();
  });

  it("inspects regional subtags even on English tags", () => {
    expect(langFromAcceptLanguage("en-RO,en;q=0.9")).toBe("ro");
    expect(langFromAcceptLanguage("en-MD,en;q=0.9")).toBe("ro");
    expect(langFromAcceptLanguage("en-AL,en;q=0.9")).toBe("sq");
    expect(langFromAcceptLanguage("en-XK,en;q=0.9")).toBe("sq");
    expect(langFromAcceptLanguage("en-IT,en;q=0.9")).toBe("it");
    expect(langFromAcceptLanguage("en-HR,en;q=0.9")).toBe("hr");
    expect(langFromAcceptLanguage("en-Latn-RO,en;q=0.8")).toBe("ro");
  });

  it("prefers secondary target languages with q >= 0.5 when generic English sits on top", () => {
    expect(langFromAcceptLanguage("en-US,en;q=0.9,ro;q=0.8")).toBe("ro");
    expect(langFromAcceptLanguage("en-US,en;q=0.9,ro;q=0.5")).toBe("ro");
    expect(langFromAcceptLanguage("en-US,en;q=0.9,ro;q=0.49")).toBe("en");
    expect(langFromAcceptLanguage("en-US,en;q=0.9,sq;q=0.6,ro;q=0.8")).toBe("ro");
    expect(langFromAcceptLanguage("en-US,en;q=0.9,it;q=0.7,hr;q=0.7")).toBe("it");
    expect(langFromAcceptLanguage("en-US,en;q=0.9,rmy;q=0.6")).toBe("rom");
    expect(langFromAcceptLanguage("en-US,en;q=0.9,ro;q=0")).toBe("en");
    expect(langFromAcceptLanguage("en-US,en;q=0.9")).toBe("en");
  });
});

describe("detectPreferredLocaleFromRequest", () => {
  it("gives manual override cookie highest priority over Geo-IP, timezone, and Accept-Language", () => {
    expect(
      detectPreferredLocaleFromRequest({
        cookies: cookieJar({ [LOCALE_MANUAL_COOKIE]: "1", [LOCALE_COOKIE]: "en" }),
        headers: new Headers({
          "cf-ipcountry": "RO",
          "x-vercel-ip-timezone": "Europe/Bucharest",
          "accept-language": "ro-RO,ro;q=0.9",
        }),
      }),
    ).toBe("en");

    // Without manual override, Geo-IP overrides a stale automatic cookie.
    expect(
      detectPreferredLocaleFromRequest({
        cookies: cookieJar({ [LOCALE_COOKIE]: "en" }),
        headers: new Headers({ "cf-ipcountry": "RO" }),
      }),
    ).toBe("ro");
  });

  it("applies Moldova Russian vs Romanian preference based on Accept-Language", () => {
    expect(
      detectPreferredLocaleFromRequest({
        cookies: cookieJar(),
        headers: new Headers({
          "cf-ipcountry": "MD",
          "accept-language": "ru-MD,ru;q=0.9,ro;q=0.8",
        }),
      }),
    ).toBe("ru");

    expect(
      detectPreferredLocaleFromRequest({
        cookies: cookieJar(),
        headers: new Headers({
          "cf-ipcountry": "MD",
          "accept-language": "en-US,ru;q=0.7",
        }),
      }),
    ).toBe("ru");

    expect(
      detectPreferredLocaleFromRequest({
        cookies: cookieJar(),
        headers: new Headers({
          "cf-ipcountry": "MD",
          "accept-language": "ro-MD,ro;q=0.9,ru;q=0.8",
        }),
      }),
    ).toBe("ro");

    expect(
      detectPreferredLocaleFromRequest({
        cookies: cookieJar(),
        headers: new Headers({
          "cf-ipcountry": "MD",
          "accept-language": "en-US,en;q=0.9",
        }),
      }),
    ).toBe("ro");
  });

  it("falls back through timezone, automatic cookie, Accept-Language, and DEFAULT_LANG", () => {
    expect(
      detectPreferredLocaleFromRequest({
        cookies: cookieJar({ [LOCALE_COOKIE]: "en" }),
        headers: new Headers({ "x-vercel-ip-timezone": "Europe/Bucharest" }),
      }),
    ).toBe("ro");

    expect(
      detectPreferredLocaleFromRequest({
        cookies: cookieJar({ [LOCALE_COOKIE]: "it" }),
        headers: new Headers({ "cf-ipcountry": "DE" }),
      }),
    ).toBe("it");

    expect(
      detectPreferredLocaleFromRequest({
        cookies: cookieJar(),
        headers: new Headers({
          "cf-ipcountry": "DE",
          "accept-language": "en-US,en;q=0.9,ro;q=0.8",
        }),
      }),
    ).toBe("ro");

    expect(
      detectPreferredLocaleFromRequest({
        cookies: cookieJar(),
        headers: new Headers({ "cf-ipcountry": "DE", "accept-language": "de-DE" }),
      }),
    ).toBe("en");
  });
});

describe("detectClientPreferredLocale", () => {
  it("detects local Romanian visitors using an English browser in Bucharest timezone", () => {
    expect(
      detectClientPreferredLocale({
        languages: ["en-US", "en"],
        timeZone: "Europe/Bucharest",
      }),
    ).toBe("ro");
  });

  it("honors explicit non-English primary tags over timezone", () => {
    expect(
      detectClientPreferredLocale({
        languages: ["sq-AL", "it-IT"],
        timeZone: "Europe/Rome",
      }),
    ).toBe("sq");

    expect(
      detectClientPreferredLocale({
        languages: ["ru-RU", "ro"],
        timeZone: "Europe/Chisinau",
      }),
    ).toBe("ru");
  });

  it("handles regional subtags, secondary languages, English-only, and unmapped clients", () => {
    expect(
      detectClientPreferredLocale({
        languages: ["en-RO", "en"],
        timeZone: "America/New_York",
      }),
    ).toBe("ro");

    expect(
      detectClientPreferredLocale({
        languages: ["en-US", "ro-RO"],
        timeZone: "America/New_York",
      }),
    ).toBe("ro");

    expect(
      detectClientPreferredLocale({
        languages: ["de-DE", "en-IT"],
        timeZone: "Europe/Berlin",
      }),
    ).toBe("it");

    expect(
      detectClientPreferredLocale({
        languages: ["en-US", "en"],
        timeZone: "America/New_York",
      }),
    ).toBe("en");

    expect(
      detectClientPreferredLocale({
        languages: ["de-DE", "fr-FR"],
        timeZone: "Europe/Berlin",
      }),
    ).toBeNull();

    expect(
      detectClientPreferredLocale({
        languages: null,
        timeZone: "Europe/Tirane",
      }),
    ).toBe("sq");
  });
});

describe("isAutomatedOrAuditUserAgent & hasManualLocaleCookie", () => {
  it("detects Lighthouse, bots, and webdriver sessions without flagging normal browsers", () => {
    expect(isAutomatedOrAuditUserAgent("Mozilla/5.0", true)).toBe(true);
    expect(
      isAutomatedOrAuditUserAgent(
        "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/119.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse",
        false,
      ),
    ).toBe(true);
    expect(isAutomatedOrAuditUserAgent("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
    expect(isAutomatedOrAuditUserAgent("Mozilla/5.0 HeadlessChrome/125.0.0.0")).toBe(true);
    expect(isAutomatedOrAuditUserAgent("WhatsApp/2.23.20.0 A")).toBe(true);

    expect(
      isAutomatedOrAuditUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        false,
      ),
    ).toBe(false);
  });

  it("parses manual locale cookie strings accurately", () => {
    expect(hasManualLocaleCookie(`${LOCALE_COOKIE}=en; ${LOCALE_MANUAL_COOKIE}=1`)).toBe(true);
    expect(hasManualLocaleCookie(`${LOCALE_MANUAL_COOKIE}=0`)).toBe(false);
    expect(hasManualLocaleCookie("")).toBe(false);
  });
});

describe("proxy locale redirection and Vary headers", () => {
  it("redirects bare paths using smart detection with Vary headers and without setting manual override", async () => {
    const req = new NextRequest("https://redihealth.org/", {
      headers: {
        "cf-ipcountry": "RO",
        "accept-language": "en-US,en;q=0.9",
      },
    });
    const res = (await proxy(req, fetchEvent())) as NextResponse;
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location")!).pathname).toBe("/ro");
    expect(res.headers.get("vary")).toBe("Accept-Language, CF-IPCountry, X-Vercel-IP-Country");
    expect(res.cookies.get(LOCALE_COOKIE)?.value).toBe("ro");
    expect(res.cookies.get(LOCALE_MANUAL_COOKIE)).toBeUndefined();
  });

  it("keeps canonical locale routes intact without redirecting", async () => {
    const req = new NextRequest("https://redihealth.org/en", {
      headers: { "cf-ipcountry": "RO" },
    });
    const res = (await proxy(req, fetchEvent())) as NextResponse;
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
    expect(res.headers.get("x-middleware-request-" + REQUEST_LANG_HEADER)).toBe("en");
  });

  it("passes the website statistics context to the page but drops the statistics cookie", async () => {
    vi.mocked(analyticsMiddleware).mockClear();
    const res = (await proxy(new NextRequest("https://redihealth.org/ro/find-help", { headers: { "sec-fetch-dest": "document" } }), fetchEvent())) as NextResponse;
    expect(analyticsMiddleware).toHaveBeenCalledTimes(1);
    expect(res.headers.get("x-middleware-request-x-nl-page-render-id")).toBe("render-1");
    expect(res.headers.get("x-nl-page-render-id")).toBeNull();
    expect(res.cookies.get("last-page-render-id")).toBeUndefined();
  });

  it("hands /api/event to the statistics middleware and refuses cross-site posts", async () => {
    vi.mocked(analyticsMiddleware).mockClear();
    await proxy(new NextRequest("https://redihealth.org/api/event", { method: "POST", headers: { "sec-fetch-site": "same-origin" } }), fetchEvent());
    expect(analyticsMiddleware).toHaveBeenCalledTimes(1);

    const crossSite = await proxy(new NextRequest("https://redihealth.org/api/event", { method: "POST", headers: { "sec-fetch-site": "cross-site" } }), fetchEvent());
    expect(crossSite.status).toBe(403);
    expect(analyticsMiddleware).toHaveBeenCalledTimes(1);
  });

  it("keeps serving pages when the statistics middleware fails", async () => {
    vi.mocked(analyticsMiddleware).mockRejectedValueOnce(new Error("database down"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = await proxy(new NextRequest("https://redihealth.org/en"), fetchEvent());
    expect(res.status).toBe(200);
    warn.mockRestore();
  });
});

describe("GET /api/geo-locale", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("resolves directly from CDN country and timezone headers without external fetch", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const countryRes = await getGeoLocale(
      new Request("https://redihealth.org/api/geo-locale", {
        headers: { "cf-ipcountry": "RO" },
      }),
    );
    expect(countryRes.status).toBe(200);
    expect(countryRes.headers.get("Cache-Control")).toBe("private, max-age=3600");
    expect(await countryRes.json()).toEqual({ country: "RO", lang: "ro", source: "header" });

    const tzRes = await getGeoLocale(
      new Request("https://redihealth.org/api/geo-locale", {
        headers: { "x-vercel-ip-timezone": "Europe/Bucharest" },
      }),
    );
    expect(await tzRes.json()).toEqual({ country: null, lang: "ro", source: "timezone" });

    const unmappedCountryRes = await getGeoLocale(
      new Request("https://redihealth.org/api/geo-locale", {
        headers: { "cf-ipcountry": "DE", "x-forwarded-for": "86.120.10.5" },
      }),
    );
    expect(await unmappedCountryRes.json()).toEqual({ country: "DE", lang: null, source: "header" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("skips external lookup for loopback and private IPs", async () => {
    vi.stubEnv("REDIHEALTH_TRUST_PROXY_HEADERS", "true");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    for (const ip of ["127.0.0.1", "10.0.0.8", "192.168.1.42", "172.16.5.1", "172.31.255.1", "::1", "fc00::1", "::ffff:127.0.0.1"]) {
      const res = await getGeoLocale(
        new Request("https://redihealth.org/api/geo-locale", {
          headers: { "x-forwarded-for": ip },
        }),
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ country: null, lang: null, source: "none" });
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("queries Geo-IP for public routable IPs and fails open on network errors", async () => {
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
        headers: { "x-forwarded-for": "86.120.10.5, 10.0.0.1" },
      }),
    );
    expect(okRes.status).toBe(200);
    expect(await okRes.json()).toEqual({ country: "RO", lang: "ro", source: "geoip" });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe("https://api.country.is/86.120.10.5");

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    const failRes = await getGeoLocale(
      new Request("https://redihealth.org/api/geo-locale", {
        headers: { "x-real-ip": "86.120.10.5" },
      }),
    );
    expect(failRes.status).toBe(200);
    expect(await failRes.json()).toEqual({ country: null, lang: null, source: "none" });
  });
});
