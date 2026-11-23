import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";
import { getCountryDatabase, isCountryConfigured, isUniqueViolation, type ResultSetHeader } from "@/lib/database";
import { getClientIp } from "@/lib/rate-limit";
import { generatePortalToken, hashPortalToken } from "@/lib/security/portal-token";
import { requireStaff } from "@/lib/staff-access";
import { isValidEmail, text } from "@/lib/text";

function generateIntakePlaceholderEmail() {
  return `no-email-${randomBytes(8).toString("hex")}@intake.redi.invalid`;
}

export async function POST(request: Request) {
  // Assisted intake creates a patient record, so it is for signed-in staff only.
  const access = await requireStaff();
  if ("error" in access) return access.error;
  const { country, workerId } = access.worker;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }

  const fullName = text(body.fullName);
  const effectivePhone = (text(body.phone) || text(body.familyContactPhone)).replace(/\s+/g, "");
  const providedEmail = text(body.email).toLowerCase();
  const county = text(body.county) || "București";
  const locality = text(body.locality);
  const age = text(body.age);
  const symptomCategory = text(body.symptomCategory) || "General";
  const chiefComplaint = text(body.chiefComplaint);
  const hasDocument = Boolean(body.documentScanUrl);

  if (!fullName || !effectivePhone) {
    return NextResponse.json(
      { error: "Numele complet și un număr de contact sunt obligatorii." },
      { status: 400 },
    );
  }
  if (providedEmail && !isValidEmail(providedEmail)) {
    return NextResponse.json({ error: "Adresa de email nu este validă." }, { status: 400 });
  }
  if (
    fullName.length > 200 || effectivePhone.length > 50 || providedEmail.length > 320 || county.length > 100 || locality.length > 200 ||
    age.length > 20 || symptomCategory.length > 100 || chiefComplaint.length > 4000
  ) {
    return NextResponse.json({ error: "Unul sau mai multe câmpuri sunt prea lungi." }, { status: 400 });
  }

  if (!isCountryConfigured(country)) {
    return NextResponse.json({ error: "Pacientul nu a putut fi înregistrat." }, { status: 503 });
  }

  const email = providedEmail || generateIntakePlaceholderEmail();
  const portalToken = generatePortalToken();
  let patientId: number;
  try {
    const connection = await getCountryDatabase(country).getConnection();
    try {
      // The patient and the mediator's case are saved together or not at all.
      await connection.beginTransaction();
      const [patientRes] = await connection.query<ResultSetHeader>(
        `INSERT INTO patients (
          full_name, phone, email, county, condition_notes, assigned_worker_id, assigned_worker_ids,
          access_token_hash, access_token_expires_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW() + INTERVAL '90 days', NOW()) RETURNING id`,
        [
          fullName,
          effectivePhone,
          email,
          county,
          `[Intake Mediator: ${symptomCategory}] ${chiefComplaint || "Fără plângeri detaliate."} | Localitate: ${locality || "Nespecificată"} | Vârstă: ${age || "Nespecificată"} | Document: ${hasDocument ? "Scanat" : "Lipsă"}`,
          workerId,
          JSON.stringify([workerId]),
          hashPortalToken(portalToken),
        ],
      );
      await connection.query<ResultSetHeader>(
        `INSERT INTO mediator_cases (
          mediator_worker_id, county, full_name, phone,
          care_category, urgency, barriers, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, 'moderate', ?, ?, NOW())`,
        [
          workerId,
          county,
          fullName,
          effectivePhone,
          symptomCategory,
          JSON.stringify({ illiterateOrAssisted: true, hasDocument }),
          chiefComplaint || null,
        ],
      );
      await connection.commit();
      patientId = patientRes.insertId;
    } catch (error) {
      await connection.rollback().catch(() => undefined);
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "Există deja un pacient înregistrat cu această adresă de email." },
        { status: 409 },
      );
    }
    // Never report success for a record that was not saved.
    console.error("Proxy patient intake could not be saved", error);
    return NextResponse.json({ error: "Pacientul nu a putut fi înregistrat." }, { status: 503 });
  }

  await logActivity({
    country,
    actorWorkerId: workerId,
    actorName: access.worker.workerName,
    actorEmail: access.email,
    actorRole: access.worker.role,
    action: "patient.intake_created",
    entityType: "patient",
    entityId: patientId,
    details: {
      full_name: fullName,
      county,
      symptom_category: symptomCategory,
      has_email: Boolean(providedEmail),
      portal_token_issued: true,
    },
    ipAddress: getClientIp(request),
  });

  return NextResponse.json({
    success: true,
    patientId,
    portalToken,
    portalUrl: `/patient-portal/${portalToken}?c=${country.toLowerCase()}`,
    message: `Pacientul ${fullName} a fost înregistrat cu succes prin protocolul asistat.`,
  });
}
