import { NextResponse } from "next/server";
import { getCountryDatabase, isCountryConfigured, type ResultSetHeader } from "@/lib/database";
import { generatePortalToken, hashPortalToken } from "@/lib/security/portal-token";
import { requireStaff } from "@/lib/staff-access";
import { text } from "@/lib/text";

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
  if (
    fullName.length > 200 || effectivePhone.length > 50 || county.length > 100 || locality.length > 200 ||
    age.length > 20 || symptomCategory.length > 100 || chiefComplaint.length > 4000
  ) {
    return NextResponse.json({ error: "Unul sau mai multe câmpuri sunt prea lungi." }, { status: 400 });
  }

  if (!isCountryConfigured(country)) {
    return NextResponse.json({ error: "Pacientul nu a putut fi înregistrat." }, { status: 503 });
  }

  const portalToken = generatePortalToken();
  const connection = await getCountryDatabase(country).getConnection();
  try {
    // The patient and the mediator's case are saved together or not at all.
    await connection.beginTransaction();
    const [patientRes] = await connection.query<ResultSetHeader>(
      `INSERT INTO patients (
        full_name, phone, county, condition_notes, assigned_worker_id,
        access_token_hash, access_token_expires_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 90 DAY), NOW())`,
      [
        fullName,
        effectivePhone,
        county,
        `[Intake Mediator: ${symptomCategory}] ${chiefComplaint || "Fără plângeri detaliate."} | Localitate: ${locality || "Nespecificată"} | Vârstă: ${age || "Nespecificată"} | Document: ${hasDocument ? "Scanat" : "Lipsă"}`,
        workerId,
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

    return NextResponse.json({
      success: true,
      patientId: patientRes.insertId,
      portalToken,
      portalUrl: `/patient-portal/${portalToken}?c=${country.toLowerCase()}`,
      message: `Pacientul ${fullName} a fost înregistrat cu succes prin protocolul asistat.`,
    });
  } catch (error) {
    await connection.rollback().catch(() => undefined);
    // Never report success for a record that was not saved.
    console.error("Proxy patient intake could not be saved", error);
    return NextResponse.json({ error: "Pacientul nu a putut fi înregistrat." }, { status: 503 });
  } finally {
    connection.release();
  }
}
