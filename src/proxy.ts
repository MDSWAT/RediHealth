import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LANG, LOCALE_COOKIE, getLangFromPathname, isSupportedLang, stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";

function getPreferredLang(request: NextRequest) {
  const cookieLang = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLang && isSupportedLang(cookieLang)) {
    return cookieLang;
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
    response.cookies.set(LOCALE_COOKIE, lang, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = stripLangFromPathname(pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-redihealth-lang", localeInPath);
  const response = NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });
  response.cookies.set(LOCALE_COOKIE, localeInPath, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
