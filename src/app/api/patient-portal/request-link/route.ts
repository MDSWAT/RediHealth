import { NextResponse } from "next/server";
import { getDatabase, type ResultSetHeader, type RowDataPacket } from "@/lib/database";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendPatientPortalLinkEmail, isEmailConfigured } from "@/lib/email";
import { generatePortalToken, hashPortalToken } from "@/lib/security/portal-token";
import { getRequestLang } from "@/lib/i18n/server-routing";
import { parseJsonColumn } from "@/lib/json";
import type { TreatmentPlan } from "@/lib/types/patient";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const genericResponse = {
  success: true,
  message: "If a patient portal is registered to that email, a new link will be sent shortly.",
};

function isMissingAccessTokenExpiryColumnError(error: unknown): boolean {
  const dbError = error as { code?: string; errno?: number; sqlMessage?: string; message?: string };
  return (
    (dbError.code === "ER_BAD_FIELD_ERROR" || dbError.errno === 1054)
    && /access_token_expires_at/i.test(dbError.sqlMessage || dbError.message || "")
  );
}

export async function POST(request: Request) {
  const ipRateLimit = checkRateLimit(`patient-portal-link:ip:${getClientIp(request)}`, {
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
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const emailRateLimit = checkRateLimit(`patient-portal-link:email:${email}`, {
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

  try {
    const db = getDatabase();
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, full_name, email, condition_notes, treatment_plan
       FROM patients
       WHERE LOWER(email) = ?
       LIMIT 1`,
      [email],
    );
    const patient = rows[0];
    if (!patient) {
      return NextResponse.json(genericResponse);
    }

    const accessToken = generatePortalToken();
    const tokenHash = hashPortalToken(accessToken);
    try {
      await db.query<ResultSetHeader>(
        `UPDATE patients
         SET access_token_hash = ?, access_token_expires_at = NULL
         WHERE id = ?`,
        [tokenHash, patient.id],
      );
    } catch (error) {
      if (!isMissingAccessTokenExpiryColumnError(error)) throw error;
      await db.query<ResultSetHeader>(
        "UPDATE patients SET access_token_hash = ? WHERE id = ?",
        [tokenHash, patient.id],
      );
    }

    const emailSent = await sendPatientPortalLinkEmail({
      name: patient.full_name,
      email: patient.email,
      accessToken,
      lang: await getRequestLang(request),
      treatmentPlan: parseJsonColumn<TreatmentPlan>(patient.treatment_plan),
      conditionNotes: patient.condition_notes,
      baseUrl: new URL(request.url).origin,
    });
    if (!emailSent) {
      console.error("Patient portal recovery email could not be sent.");
    }
    return NextResponse.json(genericResponse);
  } catch (error) {
    console.error("Failed to process patient portal link request", error);
    return NextResponse.json(
      { error: "Could not process your request. Please try again shortly." },
      { status: 503 },
    );
  }
}
