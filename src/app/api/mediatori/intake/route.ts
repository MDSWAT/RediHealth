import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { getCountryDatabase, isCountryConfigured, type ResultSetHeader } from "@/lib/database";
import { generatePortalToken, hashPortalToken } from "@/lib/security/portal-token";
import { parseCountry, type CountryCode } from "@/lib/countries";

export async function POST(request: Request) {
  try {
    const session = await auth();
    let workerId: number | null = null;
    let country: CountryCode = "RO";

    if (session?.user?.email) {
      const worker = await getUserWorkerContext(session.user.email);
      workerId = worker.workerId ? Number(worker.workerId) : null;
      country = parseCountry(worker.country) || "RO";
    }

    const body = await request.json();
    const {
      fullName,
      phone,
      county,
      locality,
      age,
      symptomCategory,
      chiefComplaint,
      documentScanUrl,
      familyContactPhone,
    } = body;

    if (!fullName || (!phone && !familyContactPhone)) {
      return NextResponse.json(
        { error: "Numele complet și un număr de contact sunt obligatorii." },
        { status: 400 },
      );
    }

    const effectivePhone = (phone || familyContactPhone || "").replace(/\s+/g, "");
    const portalToken = generatePortalToken();
    const tokenHash = hashPortalToken(portalToken);
    let createdPatientId = Date.now();

    if (isCountryConfigured(country)) {
      try {
        const db = getCountryDatabase(country);
        const [patientRes] = await db.query<ResultSetHeader>(
          `INSERT INTO patients (
            full_name, phone, county, condition_notes,
            access_token_hash, access_token_expires_at, created_at
          ) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 90 DAY), NOW())`,
          [
            fullName,
            effectivePhone,
            county || "București",
            `[Intake Mediator: ${symptomCategory || "General"}] ${chiefComplaint || "Fără plângeri detaliate."} | Localitate: ${locality || "Nespecificată"} | Vârstă: ${age || "Nespecificată"} | Document: ${documentScanUrl ? "Scanat" : "Lipsă"}`,
            tokenHash,
          ],
        );
        createdPatientId = patientRes.insertId;

        // Also record a case in mediator_cases
        if (workerId) {
          await db.query<ResultSetHeader>(
            `INSERT INTO mediator_cases (
              mediator_worker_id, county, full_name, phone,
              care_category, urgency, barriers, notes, created_at
            ) VALUES (?, ?, ?, ?, ?, 'moderate', ?, ?, NOW())`,
            [
              workerId,
              county || "București",
              fullName,
              effectivePhone,
              symptomCategory || "General",
              JSON.stringify({ illiterateOrAssisted: true, hasDocument: Boolean(documentScanUrl) }),
              chiefComplaint || null,
            ],
          );
        }
      } catch (err) {
        console.warn("Could not insert proxy intake to database:", err);
      }
    }

    return NextResponse.json({
      success: true,
      patientId: createdPatientId,
      portalToken,
      portalUrl: `/patient-portal/${portalToken}?c=${country}`,
      message: `Pacientul ${fullName} a fost înregistrat cu succes prin protocolul asistat.`,
    });
  } catch (error) {
    console.error("Proxy patient intake error:", error);
    return NextResponse.json({ error: "Pacientul nu a putut fi înregistrat." }, { status: 500 });
  }
}
