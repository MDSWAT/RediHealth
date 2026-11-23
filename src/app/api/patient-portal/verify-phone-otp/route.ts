import { NextResponse } from "next/server";
import {
  PHONE_OTP_COOKIE,
  decryptPhoneOtp,
  isPhoneOtpDemoEnabled,
  normalizeOtpPhone,
  otpStore,
  readCookieValue,
} from "@/lib/security/portal-otp-store";
import { generatePortalToken, hashPortalToken } from "@/lib/security/portal-token";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { configuredCountries, getCountryDatabase, type ResultSetHeader, type RowDataPacket } from "@/lib/database";

function clearOtpCookie(response: NextResponse): NextResponse {
  response.cookies.set(PHONE_OTP_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
  return response;
}

export async function POST(request: Request) {
  // No SMS provider is connected yet; see isPhoneOtpDemoEnabled.
  if (!isPhoneOtpDemoEnabled()) {
    return NextResponse.json(
      {
        error: "Autentificarea prin SMS nu este disponibilă încă. Folosește linkul primit pe email.",
        code: "sms_unavailable",
      },
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

    const memoryEntry = otpStore.get(phone);
    if (memoryEntry?.consumed) {
      return clearOtpCookie(
        NextResponse.json(
          { error: "Codul introdus este incorect sau a expirat.", code: "invalid_code" },
          { status: 400 },
        ),
      );
    }

    let activeEntry = memoryEntry;
    if (!activeEntry) {
      const cookieToken = readCookieValue(request.headers.get("cookie"), PHONE_OTP_COOKIE);
      if (cookieToken) {
        const cookieEntry = await decryptPhoneOtp(cookieToken);
        if (cookieEntry && cookieEntry.phone === phone) {
          activeEntry = cookieEntry;
        }
      }
    }

    if (!activeEntry || activeEntry.otp !== otp) {
      return NextResponse.json(
        { error: "Codul introdus este incorect sau a expirat.", code: "invalid_code" },
        { status: 400 },
      );
    }

    if (Date.now() > activeEntry.expiresAt) {
      otpStore.delete(phone);
      return clearOtpCookie(
        NextResponse.json(
          { error: "Codul SMS a expirat. Solicită un cod nou.", code: "invalid_code" },
          { status: 400 },
        ),
      );
    }

    const accessToken = generatePortalToken();
    const tokenHash = hashPortalToken(accessToken);
    // `phone` is digits only (plus an optional leading +), so it cannot inject LIKE wildcards.
    const phoneSuffix = phone.replace(/^\+/, "").slice(-9);
    const countries = configuredCountries();
    let dbFailures = 0;
    let sharedPhoneMatch = false;

    for (const country of countries) {
      try {
        const db = getCountryDatabase(country);
        const [rows] = await db.query<RowDataPacket[]>(
          "SELECT id FROM patients WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(phone, ''), ' ', ''), '-', ''), '.', ''), '(', ''), ')', ''), '+', '') LIKE ? LIMIT 2",
          [`%${phoneSuffix}`],
        );
        // Several patients sharing a number (a family phone) cannot be told apart by phone alone.
        if (rows.length > 1) {
          sharedPhoneMatch = true;
          continue;
        }
        if (rows.length !== 1) continue;

        await db.query<ResultSetHeader>(
          `UPDATE patients
           SET access_token_hash = ?, access_token_expires_at = NOW() + INTERVAL '90 days'
           WHERE id = ?`,
          [tokenHash, rows[0].id],
        );
        otpStore.set(phone, { ...activeEntry, consumed: true });
        return clearOtpCookie(
          NextResponse.json({
            success: true,
            redirectUrl: `/patient-portal/${accessToken}?c=${country.toLowerCase()}`,
          }),
        );
      } catch (error) {
        dbFailures += 1;
        console.error(`Phone sign-in lookup failed for ${country}`, error);
      }
    }

    if (countries.length === 0 || dbFailures === countries.length) {
      return NextResponse.json(
        { error: "Nu am putut verifica contul acum. Încearcă din nou în câteva minute.", code: "service_unavailable" },
        { status: 503 },
      );
    }

    otpStore.set(phone, { ...activeEntry, consumed: true });

    if (sharedPhoneMatch) {
      return clearOtpCookie(
        NextResponse.json(
          { error: "Acest număr de telefon este asociat mai multor pacienți.", code: "shared_phone" },
          { status: 409 },
        ),
      );
    }

    return clearOtpCookie(
      NextResponse.json(
        { error: "Nu am găsit un dosar medical asociat acestui număr de telefon.", code: "no_patient_record" },
        { status: 404 },
      ),
    );
  } catch (error) {
    console.error("Error verifying phone OTP:", error);
    return NextResponse.json({ error: "Codul SMS nu a putut fi verificat." }, { status: 500 });
  }
}
