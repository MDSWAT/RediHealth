import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { LOCALE_COOKIE, REQUEST_LANG_HEADER, getLangFromPathname, stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";
import { detectPreferredLocaleFromRequest } from "@/lib/i18n/locale-detection";
import { buildContentSecurityPolicy, createNonce, meetingOriginFromEnv } from "@/lib/security/csp";
import { resolveCountyFromHeaders, USER_COUNTY_HEADER, REDIHEALTH_COUNTY_HEADER } from "@/lib/geo-ip-server";
import { getSiteUrl, normalizeOrigin } from "@/lib/site-url";
import { ANALYTICS_EVENT_ENDPOINT, analyticsMiddleware } from "@/nextlytics";

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const PRIVATE_PREFIXES = ["/panel", "/offline", "/sign-in", "/patient-portal", "/health-check/note"];
const PHI_PAGE_PREFIXES = ["/panel", "/patient-portal"];
const PHI_API_PREFIXES = [
  "/api/patients",
  "/api/patient-portal",
  "/api/meetings",
  "/api/medical-help-requests",
  "/api/telemetry",
  "/api/activity-logs",
  "/api/workers",
  "/api/mediatori",
  "/api/offline",
];
const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isAllowedOrigin(rawOrigin: string, request: NextRequest): boolean {
  if (!/^https?:\/\//i.test(rawOrigin)) return false;
  const origin = normalizeOrigin(rawOrigin);
  if (!origin) return false;
  const allowed = new Set<string>([request.nextUrl.origin, getSiteUrl()]);
  const appOrigin = normalizeOrigin(process.env.APP_URL);
  const authOrigin = normalizeOrigin(process.env.AUTH_URL);
  if (appOrigin) allowed.add(appOrigin);
  if (authOrigin) allowed.add(authOrigin);
  return allowed.has(origin);
}

/** Runs Nextlytics (website statistics) and returns the request headers its server component reads. */
async function runAnalytics(request: NextRequest, event: NextFetchEvent): Promise<[string, string][]> {
  try {
    const result = await analyticsMiddleware(request, event);
    if (!(result instanceof Response)) return [];
    // Only its context headers are kept. Its "last-page-render-id" cookie is dropped: our backend
    // does not need it, so the statistics set no cookie at all.
    return [...result.headers.entries()].filter(([name]) => name.toLowerCase().startsWith("x-nl-"));
  } catch (error) {
    console.warn("Website statistics middleware failed:", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // Client-side navigations and conversion events (see src/nextlytics.ts).
  if (pathname === ANALYTICS_EVENT_ENDPOINT) {
    const secFetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase() || null;
    const origin = request.headers.get("origin")?.trim() || null;
    if (secFetchSite && secFetchSite !== "same-origin") {
      return new NextResponse(null, { status: 403 });
    }
    if (origin && !isAllowedOrigin(origin, request)) {
      return new NextResponse(null, { status: 403 });
    }
    const hasTrustedSignal =
      secFetchSite === "same-origin" || (origin !== null && isAllowedOrigin(origin, request));
    if (!hasTrustedSignal) {
      return new NextResponse(null, { status: 403 });
    }
    return (await analyticsMiddleware(request, event)) ?? NextResponse.next();
  }

  // Centralized same-origin CSRF protection and PHI cache controls for API routes.
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    const isAuthRoute = pathname === "/api/auth" || pathname.startsWith("/api/auth/");
    if (!isAuthRoute && STATE_CHANGING_METHODS.has(request.method.toUpperCase())) {
      const secFetchSite = request.headers.get("sec-fetch-site")?.trim().toLowerCase() || null;
      if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "none") {
        return NextResponse.json({ error: "Cross-site request rejected." }, { status: 403 });
      }
      const origin = request.headers.get("origin")?.trim() || null;
      if (origin && !isAllowedOrigin(origin, request)) {
        return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
      }
    }

    const response = NextResponse.next();
    if (matchesPrefix(pathname, PHI_API_PREFIXES)) {
      response.headers.set("Cache-Control", "no-store, private");
    }
    return response;
  }

  const isProd = process.env.NODE_ENV === "production";
  const localeInPath = getLangFromPathname(pathname);

  if (!localeInPath) {
    const lang = detectPreferredLocaleFromRequest({
      cookies: request.cookies,
      headers: request.headers,
    });
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = withLangPrefix(pathname, lang);
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set("Vary", "Accept-Language, CF-IPCountry, X-Vercel-IP-Country");
    response.cookies.set(LOCALE_COOKIE, lang, {
      path: "/",
      sameSite: "lax",
      secure: isProd,
      maxAge: LOCALE_COOKIE_MAX_AGE,
    });
    if (matchesPrefix(pathname, PHI_PAGE_PREFIXES)) {
      response.headers.set("Cache-Control", "no-store, private");
    }
    if (pathname.startsWith("/patient-portal/")) {
      response.headers.set("Referrer-Policy", "no-referrer");
    }
    return response;
  }

  const barePath = stripLangFromPathname(pathname);
  const nonce = createNonce();
  const csp = buildContentSecurityPolicy({
    nonce,
    isDevelopment: process.env.NODE_ENV === "development",
    meetingOrigin: meetingOriginFromEnv(),
  });

  // Next.js reads the nonce from the request's CSP header and stamps it on its own scripts.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_LANG_HEADER, localeInPath);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const cookieString = request.headers.get("cookie") || "";
  const county = resolveCountyFromHeaders(request.headers, cookieString);
  const encodedCounty = encodeURIComponent(county);
  requestHeaders.set(USER_COUNTY_HEADER, encodedCounty);
  requestHeaders.set(REDIHEALTH_COUNTY_HEADER, encodedCounty);
  for (const [name, value] of await runAnalytics(request, event)) requestHeaders.set(name, value);

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = barePath;
  const response = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set(USER_COUNTY_HEADER, encodedCounty);
  response.headers.set(REDIHEALTH_COUNTY_HEADER, encodedCounty);
  response.cookies.set(LOCALE_COOKIE, localeInPath, {
    path: "/",
    sameSite: "lax",
    secure: isProd,
    maxAge: LOCALE_COOKIE_MAX_AGE,
  });

  if (matchesPrefix(barePath, PRIVATE_PREFIXES)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  if (matchesPrefix(barePath, PHI_PAGE_PREFIXES)) {
    response.headers.set("Cache-Control", "no-store, private");
  }
  if (barePath.startsWith("/patient-portal/") || barePath === "/health-check/note") {
    // Sensitive tokens and triage note query parameters belong to the URL alone; never leak them via Referer.
    response.headers.set("Referrer-Policy", "no-referrer");
  }

  return response;
}

export const config = {
  // Covers locale-prefixed pages and all /api/* routes (Nextlytics /api/event, CSRF protection, PHI Cache-Control).
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|manifest.json|robots.txt|sitemap.xml|.*\\..*).*)",
    "/api/:path*",
  ],
};
