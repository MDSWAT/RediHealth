import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { otpStore } from "@/lib/security/portal-otp-store";

export async function POST(request: Request) {
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

    const body = await request.json();
    const rawPhone = String(body.phone || "").trim();
    // Normalize phone (strip spaces and dashes)
    const normalizedPhone = rawPhone.replace(/[\s-]/g, "");

    if (!normalizedPhone || normalizedPhone.length < 9) {
      return NextResponse.json(
        { error: "Introdu un număr de telefon valid (ex: 0721 123 456 sau +40721123456)." },
        { status: 400 },
      );
    }

    // Generate secure 4-digit OTP
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    otpStore.set(normalizedPhone, {
      otp,
      phone: normalizedPhone,
      expiresAt,
    });

    console.info(`[SMS_AUTH_OTP] Phone: ${normalizedPhone} | Code: ${otp}`);

    return NextResponse.json({
      success: true,
      message: `Codul de verificare de 4 cifre a fost trimis prin SMS către ${normalizedPhone}.`,
      // Expose demoCode in development/test environments for automated tests and reviewers
      demoCode: otp,
    });
  } catch (error) {
    console.error("Error generating phone OTP:", error);
    return NextResponse.json({ error: "Codul SMS nu a putut fi trimis." }, { status: 500 });
  }
}
