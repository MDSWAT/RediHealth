import { NextResponse } from "next/server";
import { otpStore } from "@/lib/security/portal-otp-store";
import { generatePortalToken, hashPortalToken } from "@/lib/security/portal-token";
import { configuredCountries, getCountryDatabase, type ResultSetHeader, type RowDataPacket } from "@/lib/database";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawPhone = String(body.phone || "").trim().replace(/[\s-]/g, "");
    const otp = String(body.otp || "").trim();

    if (!rawPhone || !otp) {
      return NextResponse.json({ error: "Numărul de telefon și codul sunt obligatorii." }, { status: 400 });
    }

    const storedEntry = otpStore.get(rawPhone);

    if (!storedEntry || storedEntry.otp !== otp) {
      return NextResponse.json({ error: "Codul introdus este incorect sau a expirat." }, { status: 400 });
    }

    if (Date.now() > storedEntry.expiresAt) {
      otpStore.delete(rawPhone);
      return NextResponse.json({ error: "Codul SMS a expirat. Solicită un cod nou." }, { status: 400 });
    }

    // OTP is valid!
    otpStore.delete(rawPhone);

    const accessToken = generatePortalToken();
    const tokenHash = hashPortalToken(accessToken);
    let matchedPatientId: number | null = null;
    let matchedCountry = "ro";

    // Check if patient exists in configured countries
    const countries = configuredCountries();
    for (const c of countries) {
      try {
        const db = getCountryDatabase(c);
        const [rows] = await db.query<RowDataPacket[]>(
          `SELECT id, full_name, phone FROM patients WHERE phone LIKE ? LIMIT 1`,
          [`%${rawPhone.slice(-8)}%`],
        );
        if (rows.length > 0) {
          matchedPatientId = rows[0].id;
          matchedCountry = c;
          await db.query<ResultSetHeader>(
            `UPDATE patients
             SET access_token_hash = ?, access_token_expires_at = DATE_ADD(NOW(), INTERVAL 90 DAY)
             WHERE id = ?`,
            [tokenHash, matchedPatientId],
          );
          break;
        }
      } catch {
        // Continue searching
      }
    }

    return NextResponse.json({
      success: true,
      token: accessToken,
      patientId: matchedPatientId,
      country: matchedCountry,
      redirectUrl: `/patient-portal/${accessToken}?c=${matchedCountry}`,
    });
  } catch (error) {
    console.error("Error verifying phone OTP:", error);
    return NextResponse.json({ error: "Codul SMS nu a putut fi verificat." }, { status: 500 });
  }
}
