import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { getCountryDatabase, isCountryConfigured, type RowDataPacket, type ResultSetHeader } from "@/lib/database";
import { logActivity } from "@/lib/activity-log";
import type { CareRecommendationRecord } from "@/lib/types/telemetry";

// In-memory recommendations store for patient portal sync
const liveRecommendationsStore = new Map<string, CareRecommendationRecord>();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Autentificare necesară." }, { status: 401 });
    }

    const worker = await getUserWorkerContext(session.user.email);
    if (!worker.workerId) {
      return NextResponse.json({ error: "Doar personalul medical are acces." }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      primaryDiagnosis,
      actionSteps,
      warningSigns,
      controlDate,
      additionalNotes,
      sendSms,
    } = body;

    if (!primaryDiagnosis || !actionSteps || !Array.isArray(actionSteps) || actionSteps.length === 0) {
      return NextResponse.json(
        { error: "Completează diagnosticul și cel puțin un pas." },
        { status: 400 },
      );
    }

    let patientId: number | null = null;
    let patientPhone = "";
    let patientName = "Pacient";

    if (isCountryConfigured(worker.country)) {
      try {
        const db = getCountryDatabase(worker.country);
        const [meetingRows] = await db.query<RowDataPacket[]>(
          `SELECT m.patient_id, p.full_name, p.phone
           FROM meetings m
           LEFT JOIN patients p ON p.id = m.patient_id
           WHERE m.id = ? LIMIT 1`,
          [id],
        );
        if (meetingRows.length > 0) {
          patientId = meetingRows[0].patient_id;
          patientName = meetingRows[0].full_name || patientName;
          patientPhone = meetingRows[0].phone || "";
        }
      } catch (err) {
        console.warn("Could not query patient for meeting recommendation:", err);
      }
    }

    const normalizedSteps = actionSteps.map((step: string | { id?: string; text: string; completed?: boolean }, idx: number) => {
      if (typeof step === "string") {
        return { id: `step-${idx + 1}`, text: step, completed: false };
      }
      return { id: step.id || `step-${idx + 1}`, text: step.text, completed: Boolean(step.completed) };
    });

    const recommendation: CareRecommendationRecord = {
      id: Date.now(),
      patientId,
      meetingId: Number(id),
      doctorWorkerId: worker.workerId,
      doctorName: session.user.name || "Dr. Mihai Ionescu",
      doctorSpecialty: "Medicină de familie",
      primaryDiagnosis: String(primaryDiagnosis).trim(),
      actionSteps: normalizedSteps,
      warningSigns: Array.isArray(warningSigns) ? warningSigns : [],
      controlDate: controlDate || null,
      additionalNotes: additionalNotes || null,
      createdAt: new Date().toISOString(),
    };

    // Store in live recommendations cache
    liveRecommendationsStore.set(`meeting_${id}`, recommendation);
    if (patientId) {
      liveRecommendationsStore.set(`patient_${patientId}`, recommendation);
    }

    // Try persisting to database
    if (isCountryConfigured(worker.country)) {
      try {
        const db = getCountryDatabase(worker.country);
        const [insertRes] = await db.query<ResultSetHeader>(
          `INSERT INTO patient_care_recommendations (
            patient_id, meeting_id, doctor_worker_id, doctor_name, doctor_specialty,
            primary_diagnosis, action_steps, warning_signs, control_date, additional_notes, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            patientId,
            Number(id),
            worker.workerId,
            recommendation.doctorName,
            recommendation.doctorSpecialty,
            recommendation.primaryDiagnosis,
            JSON.stringify(recommendation.actionSteps),
            JSON.stringify(recommendation.warningSigns),
            recommendation.controlDate,
            recommendation.additionalNotes,
          ],
        );
        recommendation.id = insertRes.insertId;
      } catch (dbErr) {
        console.warn("Failed inserting care recommendation to database:", dbErr);
      }
    }

    // Log activity
    await logActivity({
      country: worker.country,
      actorWorkerId: worker.workerId ? String(worker.workerId) : null,
      entityType: "meeting",
      entityId: id,
      action: "meeting.recommendations_published",
      details: {
        patientName,
        primaryDiagnosis,
        stepsCount: normalizedSteps.length,
        sendSms: Boolean(sendSms),
      },
    });

    if (sendSms && patientPhone) {
      console.info(`[SMS_RECOMMENDATION] Dispatched to ${patientPhone}: Recomandările medicului tău sunt disponibile în Contul meu: https://redimed.eu/contul-meu`);
    }

    return NextResponse.json({
      success: true,
      recommendation,
      smsDispatched: Boolean(sendSms && patientPhone),
    });
  } catch (error) {
    console.error("Failed to publish recommendation:", error);
    return NextResponse.json({ error: "Recomandările nu au putut fi publicate." }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (liveRecommendationsStore.has(`meeting_${id}`)) {
    return NextResponse.json({ recommendation: liveRecommendationsStore.get(`meeting_${id}`) });
  }
  return NextResponse.json({ recommendation: null });
}
