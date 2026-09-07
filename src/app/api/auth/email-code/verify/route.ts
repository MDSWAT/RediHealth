import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  createEmailSession,
  decryptEmailCode,
  emailAuthCookies,
} from "@/lib/email-auth";
import { checkLoginAccess } from "@/lib/login-access";
import { withLangPrefix, LOCALE_COOKIE, DEFAULT_LANG, isSupportedLang } from "@/lib/i18n/routing";

function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Too many verification attempts. Please wait and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export async function POST(request: Request) {
  const ipRateLimit = checkRateLimit(`email-code-verify:ip:${getClientIp(request)}`, {
    limit: 12,
    windowMs: 60_000,
  });
  if (!ipRateLimit.allowed) {
    return rateLimitResponse(ipRateLimit.retryAfterSeconds);
  }

  let body: { code?: string };
  try {
    body = (await request.json()) as { code?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const { code } = body;
  const normalizedCode = code?.trim();
  const cookieStore = await cookies();
  const codeToken = cookieStore.get(emailAuthCookies.otp)?.value;

  if (codeToken) {
    const tokenRateLimit = checkRateLimit(`email-code-verify:token:${codeToken}`, {
      limit: 6,
      windowMs: 10 * 60_000,
    });
    if (!tokenRateLimit.allowed) {
      return rateLimitResponse(tokenRateLimit.retryAfterSeconds);
    }
  }

  if (!codeToken || !normalizedCode) {
    return NextResponse.json(
      { error: "Your code has expired. Request a new one to continue." },
      { status: 400 },
    );
  }

  try {
    const stored = await decryptEmailCode(codeToken);
    if (stored.code !== normalizedCode) {
      return NextResponse.json(
        { error: "That code is not correct. Try again." },
        { status: 400 },
      );
    }

    const access = await checkLoginAccess(stored.email);
    if (access.reason === "database-unavailable") {
      return NextResponse.json(
        { error: "Sign-in is temporarily unavailable. Please try again shortly." },
        { status: 503 },
      );
    }

    if (!access.allowed) {
      cookieStore.delete(emailAuthCookies.otp);
      return NextResponse.json(
        { error: "This email address is not authorized to sign in." },
        { status: 403 },
      );
    }

    const session = await createEmailSession(stored.email);
    cookieStore.delete(emailAuthCookies.otp);
    cookieStore.set(emailAuthCookies.session, session, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: emailAuthCookies.sessionLifetime,
      path: "/",
    });

    const cookieLang = cookieStore.get(LOCALE_COOKIE)?.value;
    const lang = cookieLang && isSupportedLang(cookieLang) ? cookieLang : DEFAULT_LANG;
    return NextResponse.json({ success: true, redirectTo: withLangPrefix("/panel", lang) });
  } catch {
    cookieStore.delete(emailAuthCookies.otp);
    return NextResponse.json(
      { error: "Your code has expired. Request a new one to continue." },
      { status: 400 },
    );
  }
}
