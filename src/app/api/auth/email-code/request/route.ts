import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  createOneTimeCode,
  emailAuthCookies,
  encryptEmailCode,
} from "@/lib/email-auth";
import { isEmailConfigured, renderSignInCodeEmail, sendEmail } from "@/lib/email";
import { checkLoginAccess } from "@/lib/login-access";
import { isValidEmail } from "@/lib/text";
import { verifyRecaptcha } from "@/lib/security/recaptcha";

import { getRequestLang } from "@/lib/i18n/server-routing";

function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Too many sign-in attempts. Wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}

export async function POST(request: Request) {
  const ipRateLimit = await checkRateLimit(`email-code-request:ip:${getClientIp(request)}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!ipRateLimit.allowed) {
    return rateLimitResponse(ipRateLimit.retryAfterSeconds);
  }

  let body: { email?: unknown; captchaToken?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
  const normalizedEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const captchaError = await verifyRecaptcha(body.captchaToken, "email_code");
  if (captchaError) return captchaError;

  const emailRateLimit = await checkRateLimit(`email-code-request:email:${normalizedEmail}`, {
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (!emailRateLimit.allowed) {
    return rateLimitResponse(emailRateLimit.retryAfterSeconds);
  }

  if (!isEmailConfigured() || !process.env.AUTH_SECRET) {
    return NextResponse.json(
      { error: "Email sign-in is not configured yet." },
      { status: 503 },
    );
  }

  const access = await checkLoginAccess(normalizedEmail);

  if (access.reason === "database-unavailable") {
    return NextResponse.json(
      { error: "Sign-in is not working right now. Try again in a few minutes." },
      { status: 503 },
    );
  }

  // Answer the same way for unknown addresses so this endpoint cannot be used to discover staff accounts.
  if (!access.allowed) {
    return NextResponse.json({ success: true });
  }

  const code = createOneTimeCode();
  const token = await encryptEmailCode({ email: normalizedEmail, code });

  const message = renderSignInCodeEmail({ email: normalizedEmail, code, lang: await getRequestLang(request) });

  try {
    await sendEmail({
      to: normalizedEmail,
      ...message,
    });
  } catch (error) {
    let providerStatus: number | undefined;
    let transportCode: string | undefined;
    if (error && typeof error === "object") {
      if ("response" in error && error.response && typeof error.response === "object" && "status" in error.response) {
        const status = error.response.status;
        if (typeof status === "number" && Number.isInteger(status) && status >= 400 && status <= 599) {
          providerStatus = status;
        }
      }
      if ("code" in error && typeof error.code === "string" &&
        ["ETIMEDOUT", "ECONNABORTED", "ECONNRESET", "ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN", "ERR_NETWORK"].includes(error.code)) {
        transportCode = error.code;
      }
    }
    console.error("Sign-in email delivery failed.", { providerStatus, transportCode });
    return NextResponse.json(
      { error: "Could not send your sign-in code. Try again." },
      { status: 502 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(emailAuthCookies.otp, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: emailAuthCookies.otpLifetime,
    path: "/",
  });

  return NextResponse.json({ success: true });
}
