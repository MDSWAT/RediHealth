import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { getCountryDatabase, isCountryConfigured, type RowDataPacket, type ResultSetHeader } from "@/lib/database";
import { validateVitals, type VitalsTelemetryRecord } from "@/lib/types/telemetry";
import { parseCountry, type CountryCode } from "@/lib/countries";

// In-memory telemetry cache for real-time overlay during live consultations
const liveTelemetryCache = new Map<string, VitalsTelemetryRecord>();

export async function POST(request: Request) {
  try {
    const session = await auth();
    let workerId: string | number | null = null;
    let workerName = "Mediator sanitar";
    let country: CountryCode = "RO";

    if (session?.user?.email) {
      const workerContext = await getUserWorkerContext(session.user.email);
      workerId = workerContext.workerId;
      country = parseCountry(workerContext.country) || "RO";
      workerName = session.user.name || session.user.email;
    }

    const body = (await request.json()) as Partial<VitalsTelemetryRecord>;

    const validation = validateVitals(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Date biometrice invalide.", details: validation.errors },
        { status: 400 },
      );
    }

    const record: VitalsTelemetryRecord = {
      id: Date.now(),
      patientId: body.patientId || null,
      meetingId: body.meetingId || null,
      recordedByWorkerId: workerId,
      recordedByWorkerName: workerName,
      deviceKitId: body.deviceKitId || "kit-standard-01",
      bloodPressureSystolic: body.bloodPressureSystolic ?? null,
      bloodPressureDiastolic: body.bloodPressureDiastolic ?? null,
      pulseBpm: body.pulseBpm ?? null,
      oxygenSaturationPct: body.oxygenSaturationPct ?? null,
      bloodGlucoseMgDl: body.bloodGlucoseMgDl ?? null,
      glucoseContext: body.glucoseContext || "random",
      bodyTemperatureC: body.bodyTemperatureC ?? null,
      notes: body.notes || null,
      recordedAt: new Date().toISOString(),
    };

    // Store in live cache for quick doctor HUD overlay polling
    if (record.meetingId) {
      liveTelemetryCache.set(String(record.meetingId), record);
    }
    if (record.patientId) {
      liveTelemetryCache.set(`patient_${record.patientId}`, record);
    }

    // Attempt database persistence if country database is configured
    if (isCountryConfigured(country)) {
      try {
        const db = getCountryDatabase(country);
        const [result] = await db.query<ResultSetHeader>(
          `INSERT INTO patient_vitals_telemetry (
            patient_id, meeting_id, recorded_by_worker_id, device_kit_id,
            blood_pressure_systolic, blood_pressure_diastolic, pulse_bpm,
            oxygen_saturation_pct, blood_glucose_mg_dl, glucose_context,
            body_temperature_c, notes, recorded_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            record.patientId ? Number(record.patientId) : null,
            record.meetingId ? Number(record.meetingId) : null,
            record.recordedByWorkerId ? Number(record.recordedByWorkerId) : null,
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
      } catch (dbErr) {
        // Fallback gracefully if database table is pending migration
        console.warn("Telemetry database insert skipped or failed:", dbErr);
      }
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
  const { searchParams } = new URL(request.url);
  const meetingId = searchParams.get("meetingId");
  const patientId = searchParams.get("patientId");

  if (!meetingId && !patientId) {
    return NextResponse.json({ error: "Lipsește întâlnirea sau pacientul." }, { status: 400 });
  }

  // Check live cache first
  if (meetingId && liveTelemetryCache.has(meetingId)) {
    return NextResponse.json({ telemetry: liveTelemetryCache.get(meetingId) });
  }
  if (patientId && liveTelemetryCache.has(`patient_${patientId}`)) {
    return NextResponse.json({ telemetry: liveTelemetryCache.get(`patient_${patientId}`) });
  }

  // If in database, query latest
  const country: CountryCode = "RO";
  if (isCountryConfigured(country)) {
    try {
      const db = getCountryDatabase(country);
      const query = meetingId
        ? `SELECT * FROM patient_vitals_telemetry WHERE meeting_id = ? ORDER BY recorded_at DESC LIMIT 1`
        : `SELECT * FROM patient_vitals_telemetry WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 1`;
      const [rows] = await db.query<RowDataPacket[]>(query, [meetingId || patientId]);
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
    } catch {
      // Return null telemetry if not found
    }
  }

  return NextResponse.json({ telemetry: null });
}
