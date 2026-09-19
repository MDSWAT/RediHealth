import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDatabase, type ResultSetHeader, type RowDataPacket } from "@/lib/database";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { sendPatientPortalLinkEmail } from "@/lib/email";
import { parseJsonColumn } from "@/lib/json";
import { generatePortalToken, hashPortalToken } from "@/lib/security/portal-token";
import type { TreatmentPlan } from "@/lib/types/patient";

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
    const db = getDatabase();

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
    const configuredTtlDays = Number(process.env.PATIENT_PORTAL_TOKEN_TTL_DAYS || 30);
    const ttlDays = Number.isFinite(configuredTtlDays) && configuredTtlDays > 0
      ? configuredTtlDays
      : 30;
    const accessTokenExpiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    await db.query<ResultSetHeader>(
      `UPDATE patients SET access_token_hash = ?, access_token_expires_at = ? WHERE id = ?`,
      [newAccessTokenHash, accessTokenExpiresAt, patientId],
    );

    await sendPatientPortalLinkEmail({
      name: patient.full_name,
      email: patient.email,
      accessToken: newAccessToken,
      treatmentPlan: parseJsonColumn<TreatmentPlan>(patient.treatment_plan),
      conditionNotes: patient.condition_notes,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to resend patient portal link", error);
    return NextResponse.json(
      { error: "Could not resend portal link." },
      { status: 503 },
    );
  }
}
