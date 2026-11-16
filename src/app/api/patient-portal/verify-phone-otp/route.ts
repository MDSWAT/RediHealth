import { NextResponse } from "next/server";
import { isPhoneOtpDemoEnabled, normalizeOtpPhone, otpStore } from "@/lib/security/portal-otp-store";
import { generatePortalToken, hashPortalToken } from "@/lib/security/portal-token";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { configuredCountries, getCountryDatabase, type ResultSetHeader, type RowDataPacket } from "@/lib/database";

export async function POST(request: Request) {
  // No SMS provider is connected yet; see isPhoneOtpDemoEnabled.
  if (!isPhoneOtpDemoEnabled()) {
    return NextResponse.json(
      { error: "Autentificarea prin SMS nu este disponibilă încă. Folosește linkul primit pe email." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json().catch(() => null)) as { phone?: unknown; otp?: unknown } | null;
    const phone = normalizeOtpPhone(body?.phone);
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";

    if (!phone || !/^\d{4}$/.test(otp)) {
      return NextResponse.json({ error: "Numărul de telefon și codul sunt obligatorii." }, { status: 400 });
    }

    // A 4-digit code only gets a handful of guesses, per client and per phone number.
    const limits = await Promise.all([
      checkRateLimit(`phone-otp-verify:ip:${getClientIp(request)}`, { limit: 10, windowMs: 60_000 }),
      checkRateLimit(`phone-otp-verify:phone:${phone}`, { limit: 5, windowMs: 15 * 60_000 }),
    ]);
    if (limits.some((limit) => !limit.allowed)) {
      return NextResponse.json({ error: "Prea multe încercări. Solicită un cod nou mai târziu." }, { status: 429 });
    }

    const storedEntry = otpStore.get(phone);

    if (!storedEntry || storedEntry.otp !== otp) {
      return NextResponse.json({ error: "Codul introdus este incorect sau a expirat." }, { status: 400 });
    }

    if (Date.now() > storedEntry.expiresAt) {
      otpStore.delete(phone);
      return NextResponse.json({ error: "Codul SMS a expirat. Solicită un cod nou." }, { status: 400 });
    }

    otpStore.delete(phone);

    const accessToken = generatePortalToken();
    const tokenHash = hashPortalToken(accessToken);
    // `phone` is digits only (plus an optional leading +), so it cannot inject LIKE wildcards.
    const phoneSuffix = phone.replace(/^\+/, "").slice(-9);

    for (const country of configuredCountries()) {
      try {
        const db = getCountryDatabase(country);
        const [rows] = await db.query<RowDataPacket[]>(
          "SELECT id FROM patients WHERE REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '.', '') LIKE ? LIMIT 2",
          [`%${phoneSuffix}`],
        );
        // Several patients sharing a number (a family phone) cannot be told apart by phone alone.
        if (rows.length !== 1) continue;

        await db.query<ResultSetHeader>(
          `UPDATE patients
           SET access_token_hash = ?, access_token_expires_at = DATE_ADD(NOW(), INTERVAL 90 DAY)
           WHERE id = ?`,
          [tokenHash, rows[0].id],
        );
        return NextResponse.json({
          success: true,
          redirectUrl: `/patient-portal/${accessToken}?c=${country.toLowerCase()}`,
        });
      } catch (error) {
        console.error(`Phone sign-in lookup failed for ${country}`, error);
      }
    }

    // Same answer as a wrong code, so this cannot be used to discover which numbers are registered.
    return NextResponse.json({ error: "Codul introdus este incorect sau a expirat." }, { status: 400 });
  } catch (error) {
    console.error("Error verifying phone OTP:", error);
    return NextResponse.json({ error: "Codul SMS nu a putut fi verificat." }, { status: 500 });
  }
}
