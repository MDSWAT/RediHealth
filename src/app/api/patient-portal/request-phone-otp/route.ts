import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isPhoneOtpDemoEnabled, normalizeOtpPhone, otpStore } from "@/lib/security/portal-otp-store";

export async function POST(request: Request) {
  // No SMS provider is connected yet; see isPhoneOtpDemoEnabled.
  if (!isPhoneOtpDemoEnabled()) {
    return NextResponse.json(
      { error: "Autentificarea prin SMS nu este disponibilă încă. Folosește linkul primit pe email." },
      { status: 503 },
    );
  }

  try {
    const ipRateLimit = await checkRateLimit(`phone-otp:ip:${getClientIp(request)}`, {
      limit: 10,
      windowMs: 60_000,
    });
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        { error: "Prea multe încercări. Așteaptă un minut." },
        { status: 429 },
      );
    }

    const body = (await request.json().catch(() => null)) as { phone?: unknown } | null;
    const normalizedPhone = normalizeOtpPhone(body?.phone);

    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "Introdu un număr de telefon valid (ex: 0721 123 456 sau +40721123456)." },
        { status: 400 },
      );
    }

    const otp = String(randomInt(1000, 10000));
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Development-only store: drop expired codes so it cannot grow without limit.
    for (const [key, entry] of otpStore) {
      if (entry.expiresAt <= Date.now()) otpStore.delete(key);
    }
    otpStore.set(normalizedPhone, {
      otp,
      phone: normalizedPhone,
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      message: "Codul de verificare de 4 cifre a fost generat.",
      // Development only: shown on screen because no SMS is sent.
      demoCode: otp,
    });
  } catch (error) {
    console.error("Error generating phone OTP:", error);
    return NextResponse.json({ error: "Codul SMS nu a putut fi trimis." }, { status: 500 });
  }
}
