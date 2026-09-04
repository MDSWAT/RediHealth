import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createOneTimeCode,
  emailAuthCookies,
  encryptEmailCode,
} from "@/lib/email-auth";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { checkLoginAccess } from "@/lib/login-access";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
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
      { error: "Sign-in is temporarily unavailable. Please try again shortly." },
      { status: 503 },
    );
  }

  if (!access.allowed) {
    return NextResponse.json(
      { error: "This email address is not authorized to sign in." },
      { status: 403 },
    );
  }

  const code = createOneTimeCode();
  const token = await encryptEmailCode({ email: normalizedEmail, code });

  try {
    await sendEmail({
      to: normalizedEmail,
      subject: "Your RediHealth sign-in code",
      text: `Your RediHealth sign-in code is ${code}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
    });
  } catch {
    return NextResponse.json(
      { error: "We could not send your sign-in code. Please try again." },
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
