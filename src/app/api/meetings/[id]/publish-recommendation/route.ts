import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff-access";
import type { UserWorkerContext } from "@/lib/worker-auth";
import { getCountryDatabase, isCountryConfigured, type RowDataPacket, type ResultSetHeader } from "@/lib/database";
import { logActivity } from "@/lib/activity-log";
import { parseJsonColumn } from "@/lib/json";
import type { CareRecommendationRecord } from "@/lib/types/telemetry";

// Recommendations live in the country database only, so every server instance sees the same data.

type OwnedMeeting = { patient_id: number | null; full_name: string | null };

/** The meeting, when it exists in the worker's country and the worker organised it (administrators see all). */
async function findOwnedMeeting(
  worker: Pick<UserWorkerContext, "country" | "workerId" | "isAdmin">,
  meetingId: string,
): Promise<OwnedMeeting | null | "unavailable"> {
  if (!isCountryConfigured(worker.country)) return "unavailable";
  try {
    const [rows] = await getCountryDatabase(worker.country).query<(RowDataPacket & OwnedMeeting)[]>(
      `SELECT m.patient_id, p.full_name
       FROM meetings m
       LEFT JOIN patients p ON p.id = m.patient_id
       WHERE m.id = ?${worker.isAdmin ? "" : " AND m.organizer_worker_id = ?"}
       LIMIT 1`,
      worker.isAdmin ? [meetingId] : [meetingId, worker.workerId],
    );
    return rows[0] ?? null;
  } catch (error) {
    console.error("Could not load the meeting for a care recommendation", error);
    return "unavailable";
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const access = await requireStaff();
    if ("error" in access) return access.error;
    const worker = access.worker;

    const { id } = await params;
    if (!/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Consultație invalidă." }, { status: 400 });
    }
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Date invalide." }, { status: 400 });
    }

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

    // Recommendations may only be published for a meeting the doctor organised (or by an administrator).
    const meeting = await findOwnedMeeting(worker, id);
    if (meeting === "unavailable") {
      return NextResponse.json({ error: "Recomandările nu au putut fi publicate." }, { status: 503 });
    }
    if (!meeting) {
      return NextResponse.json({ error: "Consultația nu a fost găsită." }, { status: 404 });
    }
    const patientId = meeting.patient_id;
    const patientName = meeting.full_name || "Pacient";

    const normalizedSteps = (actionSteps as unknown[]).slice(0, 50).flatMap((step, idx) => {
      if (typeof step === "string") {
        return [{ id: `step-${idx + 1}`, text: step.slice(0, 1000), completed: false }];
      }
      if (!step || typeof step !== "object") return [];
      const item = step as { id?: unknown; text?: unknown; completed?: unknown };
      if (typeof item.text !== "string") return [];
      return [{
        id: typeof item.id === "string" && item.id ? item.id.slice(0, 64) : `step-${idx + 1}`,
        text: item.text.slice(0, 1000),
        completed: Boolean(item.completed),
      }];
    });
    if (normalizedSteps.length === 0) {
      return NextResponse.json(
        { error: "Completează diagnosticul și cel puțin un pas." },
        { status: 400 },
      );
    }

    const recommendation: CareRecommendationRecord = {
      id: Date.now(),
      patientId,
      meetingId: Number(id),
      doctorWorkerId: worker.workerId,
      doctorName: worker.workerName || access.name || access.email,
      doctorSpecialty: "Medicină de familie",
      primaryDiagnosis: String(primaryDiagnosis).trim().slice(0, 500),
      actionSteps: normalizedSteps,
      warningSigns: Array.isArray(warningSigns)
        ? warningSigns.filter((sign): sign is string => typeof sign === "string").slice(0, 50).map((sign) => sign.slice(0, 500))
        : [],
      controlDate: typeof controlDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(controlDate) ? controlDate : null,
      additionalNotes: typeof additionalNotes === "string" && additionalNotes.trim() ? additionalNotes.trim().slice(0, 4000) : null,
      createdAt: new Date().toISOString(),
    };

    try {
      const [insertRes] = await getCountryDatabase(worker.country).query<ResultSetHeader>(
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
    } catch (dbError) {
      // Never report recommendations as published when they were not saved (for example before migration 015).
      console.error("Care recommendation could not be saved", dbError);
      return NextResponse.json({ error: "Recomandările nu au putut fi publicate." }, { status: 503 });
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
        primaryDiagnosis: recommendation.primaryDiagnosis,
        stepsCount: normalizedSteps.length,
        sendSms: Boolean(sendSms),
      },
    });

    // No SMS gateway is connected yet, so nothing is sent and no phone number is logged.

    return NextResponse.json({
      success: true,
      recommendation,
      smsDispatched: false,
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
  const access = await requireStaff();
  if ("error" in access) return access.error;

  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Consultație invalidă." }, { status: 400 });
  }
  const meeting = await findOwnedMeeting(access.worker, id);
  if (meeting === "unavailable") {
    return NextResponse.json({ error: "Recomandările nu au putut fi încărcate." }, { status: 503 });
  }
  if (!meeting) {
    return NextResponse.json({ error: "Consultația nu a fost găsită." }, { status: 404 });
  }

  try {
    const [rows] = await getCountryDatabase(access.worker.country).query<RowDataPacket[]>(
      `SELECT id, patient_id, meeting_id, doctor_worker_id, doctor_name, doctor_specialty, primary_diagnosis,
              action_steps, warning_signs, control_date, additional_notes, created_at
       FROM patient_care_recommendations
       WHERE meeting_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT 1`,
      [id],
    );
    const row = rows[0];
    if (!row) return NextResponse.json({ recommendation: null });

    const isoDate = (value: unknown) => (value instanceof Date ? value.toISOString() : value == null ? null : String(value));
    const recommendation: CareRecommendationRecord = {
      id: row.id,
      patientId: row.patient_id,
      meetingId: row.meeting_id,
      doctorWorkerId: row.doctor_worker_id,
      doctorName: row.doctor_name,
      doctorSpecialty: row.doctor_specialty,
      primaryDiagnosis: row.primary_diagnosis,
      actionSteps: parseJsonColumn<CareRecommendationRecord["actionSteps"]>(row.action_steps) ?? [],
      warningSigns: parseJsonColumn<string[]>(row.warning_signs) ?? [],
      // A DATE column arrives as local midnight; format it locally so the day cannot shift.
      controlDate: row.control_date instanceof Date
        ? `${row.control_date.getFullYear()}-${String(row.control_date.getMonth() + 1).padStart(2, "0")}-${String(row.control_date.getDate()).padStart(2, "0")}`
        : isoDate(row.control_date)?.slice(0, 10) ?? null,
      additionalNotes: row.additional_notes,
      createdAt: isoDate(row.created_at) ?? undefined,
    };
    return NextResponse.json({ recommendation });
  } catch (error) {
    console.error("Care recommendation could not be loaded", error);
    return NextResponse.json({ error: "Recomandările nu au putut fi încărcate." }, { status: 503 });
  }
}
