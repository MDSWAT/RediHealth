import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LANG, LOCALE_COOKIE, REQUEST_LANG_HEADER, getLangFromPathname, isSupportedLang, stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";
import { countryFromHeaders, langForCountry } from "@/lib/medical-institutes";
import { buildContentSecurityPolicy, createNonce, meetingOriginFromEnv } from "@/lib/security/csp";

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const PRIVATE_PREFIXES = ["/panel", "/offline", "/sign-in", "/patient-portal"];

function getPreferredLang(request: NextRequest) {
  const cookieLang = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLang && isSupportedLang(cookieLang)) {
    return cookieLang;
  }

  // First visit: use the language of the country the visitor is browsing from.
  const countryLang = langForCountry(countryFromHeaders(request.headers));
  if (countryLang) {
    return countryLang;
  }

  const acceptLanguage = request.headers.get("accept-language") || "";
  for (const part of acceptLanguage.split(",")) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (isSupportedLang(code)) {
      return code;
    }
  }

  return DEFAULT_LANG;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localeInPath = getLangFromPathname(pathname);

  if (!localeInPath) {
    const lang = getPreferredLang(request);
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = withLangPrefix(pathname, lang);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(LOCALE_COOKIE, lang, { path: "/", sameSite: "lax", maxAge: LOCALE_COOKIE_MAX_AGE });
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

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = barePath;
  const response = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  response.cookies.set(LOCALE_COOKIE, localeInPath, { path: "/", sameSite: "lax", maxAge: LOCALE_COOKIE_MAX_AGE });

  if (PRIVATE_PREFIXES.some((prefix) => barePath === prefix || barePath.startsWith(`${prefix}/`))) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  if (barePath.startsWith("/patient-portal/")) {
    // The access token is part of the URL, so never send it along as a referrer.
    response.headers.set("Referrer-Policy", "no-referrer");
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
