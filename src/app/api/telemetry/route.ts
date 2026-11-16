import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff-access";
import { getCountryDatabase, isCountryConfigured, type RowDataPacket, type ResultSetHeader } from "@/lib/database";
import { validateVitals, type VitalsTelemetryRecord } from "@/lib/types/telemetry";
import { canAccessMeeting, canAccessPatient } from "@/lib/record-access";

// Readings live in the country database only, so every server instance sees the same data.
function recordId(value: unknown): number | null {
  const id = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  return /^\d{1,18}$/.test(id) ? Number(id) : null;
}

async function canRecordFor(
  worker: Parameters<typeof canAccessPatient>[0],
  patientId: number | null,
  meetingId: number | null,
): Promise<boolean> {
  // A reading not linked to any patient or meeting (the field kit's demo visits) touches no one's record.
  if (patientId === null && meetingId === null) return true;
  if (patientId !== null && !(await canAccessPatient(worker, patientId))) return false;
  if (meetingId !== null && !(await canAccessMeeting(worker, meetingId))) return false;
  return true;
}

export async function POST(request: Request) {
  try {
    // Vitals are patient health data: only signed-in staff may record them.
    const access = await requireStaff();
    if ("error" in access) return access.error;
    const workerId = access.worker.workerId;
    const workerName = access.worker.workerName || access.name || access.email;
    const country = access.worker.country;

    const body = (await request.json().catch(() => null)) as Partial<VitalsTelemetryRecord> | null;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Date biometrice invalide." }, { status: 400 });
    }

    const validation = validateVitals(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Date biometrice invalide.", details: validation.errors },
        { status: 400 },
      );
    }

    const record: VitalsTelemetryRecord = {
      id: Date.now(),
      patientId: recordId(body.patientId),
      meetingId: recordId(body.meetingId),
      recordedByWorkerId: workerId,
      recordedByWorkerName: workerName,
      deviceKitId: typeof body.deviceKitId === "string" && body.deviceKitId.trim() ? body.deviceKitId.trim().slice(0, 64) : "kit-standard-01",
      bloodPressureSystolic: body.bloodPressureSystolic ?? null,
      bloodPressureDiastolic: body.bloodPressureDiastolic ?? null,
      pulseBpm: body.pulseBpm ?? null,
      oxygenSaturationPct: body.oxygenSaturationPct ?? null,
      bloodGlucoseMgDl: body.bloodGlucoseMgDl ?? null,
      glucoseContext: body.glucoseContext === "fasting" || body.glucoseContext === "postprandial" ? body.glucoseContext : "random",
      bodyTemperatureC: body.bodyTemperatureC ?? null,
      notes: typeof body.notes === "string" && body.notes.trim() ? body.notes.trim().slice(0, 4000) : null,
      recordedAt: new Date().toISOString(),
    };

    if (!isCountryConfigured(country)) {
      return NextResponse.json({ error: "Datele nu au putut fi salvate." }, { status: 503 });
    }
    // A reading may only be attached to a patient or meeting this staff member works with.
    if (!(await canRecordFor(access.worker, recordId(body.patientId), recordId(body.meetingId)))) {
      return NextResponse.json({ error: "Pacientul sau întâlnirea nu a fost găsită." }, { status: 404 });
    }
    try {
      const [result] = await getCountryDatabase(country).query<ResultSetHeader>(
        `INSERT INTO patient_vitals_telemetry (
          patient_id, meeting_id, recorded_by_worker_id, device_kit_id,
          blood_pressure_systolic, blood_pressure_diastolic, pulse_bpm,
          oxygen_saturation_pct, blood_glucose_mg_dl, glucose_context,
          body_temperature_c, notes, recorded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          record.patientId,
          record.meetingId,
          Number(workerId),
          record.deviceKitId,
          record.bloodPressureSystolic,
          record.bloodPressureDiastolic,
          record.pulseBpm,
          record.oxygenSaturationPct,
          record.bloodGlucoseMgDl,
          record.glucoseContext,
          record.bodyTemperatureC,
          record.notes,
        ],
      );
      record.id = result.insertId;
    } catch (dbError) {
      // Never report a reading as saved when it was not (for example before migration 015 is applied).
      console.error("Telemetry could not be saved", dbError);
      return NextResponse.json({ error: "Datele nu au putut fi salvate." }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      record,
      validation,
    });
  } catch (error) {
    console.error("Telemetry error:", error);
    return NextResponse.json({ error: "Datele nu au putut fi procesate." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // Only signed-in staff may read vitals, and only from the country they work in.
  const access = await requireStaff();
  if ("error" in access) return access.error;
  const country = access.worker.country;

  const { searchParams } = new URL(request.url);
  const meetingId = searchParams.get("meetingId");
  const patientId = searchParams.get("patientId");

  if (!meetingId && !patientId) {
    return NextResponse.json({ error: "Lipsește întâlnirea sau pacientul." }, { status: 400 });
  }

  if (isCountryConfigured(country)) {
    try {
      const meetingRecordId = meetingId ? recordId(meetingId) : null;
      const patientRecordId = meetingId ? null : recordId(patientId);
      // Same rule as writing: only vitals of a patient or meeting this staff member works with.
      if (
        (patientRecordId === null && meetingRecordId === null) ||
        !(await canRecordFor(access.worker, patientRecordId, meetingRecordId))
      ) {
        return NextResponse.json({ telemetry: null });
      }
      const db = getCountryDatabase(country);
      const query = meetingId
        ? `SELECT * FROM patient_vitals_telemetry WHERE meeting_id = ? ORDER BY recorded_at DESC LIMIT 1`
        : `SELECT * FROM patient_vitals_telemetry WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 1`;
      const [rows] = await db.query<RowDataPacket[]>(query, [meetingId ? recordId(meetingId) : recordId(patientId)]);
      if (rows.length > 0) {
        const row = rows[0];
        const record: VitalsTelemetryRecord = {
          id: row.id,
          patientId: row.patient_id,
          meetingId: row.meeting_id,
          recordedByWorkerId: row.recorded_by_worker_id,
          deviceKitId: row.device_kit_id,
          bloodPressureSystolic: row.blood_pressure_systolic,
          bloodPressureDiastolic: row.blood_pressure_diastolic,
          pulseBpm: row.pulse_bpm,
          oxygenSaturationPct: row.oxygen_saturation_pct,
          bloodGlucoseMgDl: row.blood_glucose_mg_dl != null ? Number(row.blood_glucose_mg_dl) : null,
          glucoseContext: row.glucose_context,
          bodyTemperatureC: row.body_temperature_c != null ? Number(row.body_temperature_c) : null,
          notes: row.notes,
          recordedAt: row.recorded_at instanceof Date ? row.recorded_at.toISOString() : String(row.recorded_at),
        };
        return NextResponse.json({ telemetry: record });
      }
    } catch (error) {
      console.error("Telemetry could not be loaded", error);
      return NextResponse.json({ error: "Datele nu au putut fi încărcate." }, { status: 503 });
    }
  }

  return NextResponse.json({ telemetry: null });
}
