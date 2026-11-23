import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { NextFetchEvent } from "next/server";

const analyticsMock = vi.hoisted(() => ({
  middleware: vi.fn(),
}));

vi.mock("@/nextlytics", () => ({
  ANALYTICS_EVENT_ENDPOINT: "/api/event",
  analyticsMiddleware: analyticsMock.middleware,
}));

import { config as proxyConfig, proxy } from "@/proxy";
import nextConfig from "../next.config";

const dummyEvent = {} as NextFetchEvent;

function makeRequest(
  url: string,
  options?: { method?: string; headers?: Record<string, string> },
): NextRequest {
  return new NextRequest(url, {
    method: options?.method ?? "GET",
    headers: options?.headers,
  });
}

describe("proxy CSRF, cookie security, PHI no-store, and API CSP", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    analyticsMock.middleware.mockResolvedValue(null);
    vi.stubEnv("APP_URL", "https://redi.healthcare");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("matches all /api/* paths in proxy matcher", () => {
    expect(proxyConfig.matcher).toContain("/api/:path*");
  });

  it("rejects cross-site and mismatched-origin state-changing /api/* requests", async () => {
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      const crossSite = await proxy(
        makeRequest("https://redi.healthcare/api/patients", {
          method,
          headers: { "sec-fetch-site": "cross-site", origin: "https://evil.example" },
        }),
        dummyEvent,
      );
      expect(crossSite.status).toBe(403);

      const sameSiteSubdomain = await proxy(
        makeRequest("https://redi.healthcare/api/patients", {
          method,
          headers: { "sec-fetch-site": "same-site", origin: "https://sub.redi.healthcare" },
        }),
        dummyEvent,
      );
      expect(sameSiteSubdomain.status).toBe(403);

      const badOrigin = await proxy(
        makeRequest("https://redi.healthcare/api/patients", {
          method,
          headers: { "sec-fetch-site": "same-origin", origin: "https://evil.example" },
        }),
        dummyEvent,
      );
      expect(badOrigin.status).toBe(403);

      const nullOrigin = await proxy(
        makeRequest("https://redi.healthcare/api/patients", {
          method,
          headers: { origin: "null" },
        }),
        dummyEvent,
      );
      expect(nullOrigin.status).toBe(403);
    }
  });

  it("allows same-origin mutations, GET API requests, and /api/auth/* routes", async () => {
    const sameOriginPost = await proxy(
      makeRequest("https://redi.healthcare/api/patients", {
        method: "POST",
        headers: { "sec-fetch-site": "same-origin", origin: "https://redi.healthcare" },
      }),
      dummyEvent,
    );
    expect(sameOriginPost.status).toBe(200);
    expect(sameOriginPost.headers.get("cache-control")).toBe("no-store, private");

    const authCallbackPost = await proxy(
      makeRequest("https://redi.healthcare/api/auth/callback/google", {
        method: "POST",
        headers: { "sec-fetch-site": "cross-site", origin: "https://accounts.google.com" },
      }),
      dummyEvent,
    );
    expect(authCallbackPost.status).toBe(200);

    const getApi = await proxy(
      makeRequest("https://redi.healthcare/api/medical-institutes", {
        method: "GET",
        headers: { "sec-fetch-site": "cross-site" },
      }),
      dummyEvent,
    );
    expect(getApi.status).toBe(200);
    expect(getApi.headers.get("cache-control")).toBeNull();
  });

  it("requires Sec-Fetch-Site: same-origin or valid same-origin Origin on /api/event", async () => {
    const noHeaders = await proxy(
      makeRequest("https://redi.healthcare/api/event", { method: "POST" }),
      dummyEvent,
    );
    expect(noHeaders.status).toBe(403);

    const fetchSiteNone = await proxy(
      makeRequest("https://redi.healthcare/api/event", {
        method: "POST",
        headers: { "sec-fetch-site": "none" },
      }),
      dummyEvent,
    );
    expect(fetchSiteNone.status).toBe(403);

    const crossOrigin = await proxy(
      makeRequest("https://redi.healthcare/api/event", {
        method: "POST",
        headers: { origin: "https://evil.example" },
      }),
      dummyEvent,
    );
    expect(crossOrigin.status).toBe(403);

    const withFetchSite = await proxy(
      makeRequest("https://redi.healthcare/api/event", {
        method: "POST",
        headers: { "sec-fetch-site": "same-origin" },
      }),
      dummyEvent,
    );
    expect(withFetchSite.status).toBe(200);

    const withValidOriginOnly = await proxy(
      makeRequest("https://redi.healthcare/api/event", {
        method: "POST",
        headers: { origin: "https://redi.healthcare" },
      }),
      dummyEvent,
    );
    expect(withValidOriginOnly.status).toBe(200);
  });

  it("sets Cache-Control: no-store, private on all PHI API prefixes and /panel + /patient-portal pages", async () => {
    const phiApiPaths = [
      "/api/patients",
      "/api/patients/42/followups",
      "/api/patient-portal/abc",
      "/api/meetings",
      "/api/meetings/10/invite",
      "/api/medical-help-requests",
      "/api/telemetry",
      "/api/activity-logs",
      "/api/workers",
      "/api/mediatori/intake",
      "/api/offline/snapshot",
    ];
    for (const path of phiApiPaths) {
      const res = await proxy(makeRequest(`https://redi.healthcare${path}`), dummyEvent);
      expect(res.headers.get("cache-control"), path).toBe("no-store, private");
    }

    for (const pagePath of ["/ro/panel", "/ro/panel/patients", "/ro/patient-portal/secret-tok"]) {
      const res = await proxy(makeRequest(`https://redi.healthcare${pagePath}`), dummyEvent);
      expect(res.headers.get("cache-control"), pagePath).toBe("no-store, private");
      expect(res.headers.get("x-robots-tag"), pagePath).toBe("noindex, nofollow");
    }

    const publicPage = await proxy(makeRequest("https://redi.healthcare/ro/about"), dummyEvent);
    expect(publicPage.headers.get("cache-control")).toBeNull();
  });

  it("marks redihealth-lang cookie Secure in production and handles malformed county cookies safely", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const redirectRes = await proxy(makeRequest("https://redi.healthcare/about"), dummyEvent);
    expect(redirectRes.headers.get("set-cookie")?.toLowerCase()).toContain("secure");

    const pageRes = await proxy(
      makeRequest("https://redi.healthcare/ro/about", {
        headers: { cookie: "redi_user_county=%E0%A4%A" },
      }),
      dummyEvent,
    );
    expect(pageRes.status).toBe(200);
    expect(pageRes.headers.get("set-cookie")?.toLowerCase()).toContain("secure");
  });

  it("configures strict default-src 'none' CSP on /api/:path* in next.config.ts", async () => {
    const rules = await nextConfig.headers!();
    const apiRule = rules.find((rule) => rule.source === "/api/:path*");
    expect(apiRule).toBeDefined();
    expect(apiRule?.headers).toContainEqual({
      key: "Content-Security-Policy",
      value: "default-src 'none'; frame-ancestors 'none'",
    });
  });
});
