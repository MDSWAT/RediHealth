import { NextResponse } from "next/server";
import { configuredCountries, getCountryDatabase, type ResultSetHeader, type RowDataPacket } from "@/lib/database";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendPatientPortalLinkEmail, isEmailConfigured } from "@/lib/email";
import { PORTAL_LINK_TTL_DAYS, generatePortalToken, hashPortalToken } from "@/lib/security/portal-token";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { parseJsonColumn } from "@/lib/json";
import { isValidEmail } from "@/lib/text";
import type { TreatmentPlan } from "@/lib/types/patient";

const genericResponse = {
  success: true,
  message: "If a patient portal is registered to that email, a new link will be sent shortly.",
};

export async function POST(request: Request) {
  const ipRateLimit = await checkRateLimit(`patient-portal-link:ip:${getClientIp(request)}`, {
    limit: 8,
    windowMs: 60_000,
  });
  if (!ipRateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(ipRateLimit.retryAfterSeconds) } },
    );
  }

  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const emailRateLimit = await checkRateLimit(`patient-portal-link:email:${email}`, {
    limit: 3,
    windowMs: 10 * 60_000,
  });
  if (!emailRateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(emailRateLimit.retryAfterSeconds) } },
    );
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({ error: "Email service is temporarily unavailable." }, { status: 503 });
  }

  // The patient's country is not known from an email address, so every country database is
  // checked. Each match gets its own link, which only works against that country's data.
  const lang = await getRequestLang(request);
  const baseUrl = new URL(request.url).origin;
  let failures = 0;
  const countries = configuredCountries();

  for (const country of countries) {
    try {
      const db = getCountryDatabase(country);
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT id, full_name, email, condition_notes, treatment_plan
         FROM patients
         WHERE LOWER(email) = ?
         LIMIT 1`,
        [email],
      );
      const patient = rows[0];
      if (!patient) continue;

      const accessToken = generatePortalToken();
      await db.query<ResultSetHeader>(
        `UPDATE patients
         SET access_token_hash = ?, access_token_expires_at = DATE_ADD(NOW(), INTERVAL ? DAY)
         WHERE id = ?`,
        [hashPortalToken(accessToken), PORTAL_LINK_TTL_DAYS, patient.id],
      );

      const emailSent = await sendPatientPortalLinkEmail({
        name: patient.full_name,
        email: patient.email,
        accessToken,
        country,
        lang,
        treatmentPlan: parseJsonColumn<TreatmentPlan>(patient.treatment_plan),
        conditionNotes: patient.condition_notes,
        baseUrl,
      });
      if (!emailSent) {
        console.error("Patient portal recovery email could not be sent.");
      }
    } catch (error) {
      failures += 1;
      console.error(`Failed to process patient portal link request in ${country}`, error);
    }
  }

  if (countries.length === 0 || failures === countries.length) {
    return NextResponse.json(
      { error: "Could not process your request. Please try again shortly." },
      { status: 503 },
    );
  }
  return NextResponse.json(genericResponse);
}
