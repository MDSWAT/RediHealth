import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createEmailSession,
  decryptEmailCode,
  emailAuthCookies,
} from "@/lib/email-auth";
import { checkLoginAccess } from "@/lib/login-access";
import { withLangPrefix, LOCALE_COOKIE, DEFAULT_LANG, isSupportedLang } from "@/lib/i18n/routing";

export async function POST(request: Request) {
  const { code } = (await request.json()) as { code?: string };
  const normalizedCode = code?.trim();
  const cookieStore = await cookies();
  const codeToken = cookieStore.get(emailAuthCookies.otp)?.value;

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
