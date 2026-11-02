import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCountryDatabase, type ResultSetHeader, type RowDataPacket } from "@/lib/database";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { sendPatientPortalLinkEmail } from "@/lib/email";
import { parseJsonColumn } from "@/lib/json";
import { PORTAL_LINK_TTL_DAYS, generatePortalToken, hashPortalToken } from "@/lib/security/portal-token";
import type { TreatmentPlan } from "@/lib/types/patient";
import { getRequestLang } from "@/lib/i18n/server-routing";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workerContext = await getUserWorkerContext(session.user.email);
  if (!workerContext.workerId) {
    return NextResponse.json({ error: "Staff access is required." }, { status: 403 });
  }

  let body: { id?: string | number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const patientId = body.id ? String(body.id) : null;
  if (!patientId) {
    return NextResponse.json({ error: "Patient ID is required." }, { status: 400 });
  }

  try {
    const db = getCountryDatabase(workerContext.country);

    let query = `SELECT id, full_name, email, condition_notes, treatment_plan, access_token_hash
                 FROM patients WHERE id = ?`;
    const params: unknown[] = [patientId];

    if (!workerContext.isAdmin) {
      query += ` AND (assigned_worker_id = ? OR FIND_IN_SET(?, REPLACE(REPLACE(REPLACE(COALESCE(assigned_worker_ids, '[]'), '[', ''), ']', ''), '"', '')) > 0)`;
      params.push(workerContext.workerId, workerContext.workerId);
    }

    query += ` LIMIT 1`;

    const [rows] = await db.query<RowDataPacket[]>(query, params);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Patient not found or not assigned to you." }, { status: 404 });
    }

    const patient = rows[0];

    // Generate a new token, update the hash, and send the email
    const newAccessToken = generatePortalToken();
    const newAccessTokenHash = hashPortalToken(newAccessToken);

    await db.query<ResultSetHeader>(
      `UPDATE patients SET access_token_hash = ?, access_token_expires_at = DATE_ADD(NOW(), INTERVAL ? DAY) WHERE id = ?`,
      [newAccessTokenHash, PORTAL_LINK_TTL_DAYS, patientId],
    );

    const emailSent = await sendPatientPortalLinkEmail({
      name: patient.full_name,
      email: patient.email,
      accessToken: newAccessToken,
      country: workerContext.country,
      lang: await getRequestLang(request),
      treatmentPlan: parseJsonColumn<TreatmentPlan>(patient.treatment_plan),
      conditionNotes: patient.condition_notes,
      baseUrl: new URL(request.url).origin,
    });

    return NextResponse.json({ success: true, email_sent: emailSent });
  } catch (error) {
    console.error("Failed to resend patient portal link", error);
    return NextResponse.json(
      { error: "Could not resend portal link." },
      { status: 503 },
    );
  }
}
