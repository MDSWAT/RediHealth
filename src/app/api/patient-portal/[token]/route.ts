import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getDatabase } from "@/lib/database";
import { parseJsonColumn, stringifyJsonColumn } from "@/lib/json";
import {
  isPatientPriority,
  validateFollowupInput,
  validatePhotoInput,
} from "@/lib/validation";
import type {
  FollowupItem,
  PatientPhoto,
  TreatmentPlan,
} from "@/lib/types/patient";

const MAX_CONDITION_NOTES_LENGTH = 4_000;

interface Params {
  params: Promise<{ token: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json({ error: "Invalid token." }, { status: 400 });
  }

  try {
    const db = getDatabase();
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT p.id, p.request_id, p.access_token, p.full_name, p.phone, p.email, 
              p.date_of_birth, p.gender, p.address, p.condition_notes, p.medical_history, 
              p.treatment_plan, p.followups, p.photos, 
              COALESCE(p.status, 'active') AS status, 
              COALESCE(p.priority, 'moderate') AS priority, 
              w.full_name AS assigned_worker_name,
              p.created_at, p.updated_at
       FROM patients p
       LEFT JOIN workers w ON w.id = p.assigned_worker_id
       WHERE p.access_token = ?
       LIMIT 1`,
      [token],
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Patient portal link not found or expired." }, { status: 404 });
    }

    const r = rows[0];
    const patient = {
      ...r,
      treatment_plan: parseJsonColumn<TreatmentPlan>(r.treatment_plan),
      followups: parseJsonColumn<FollowupItem[]>(r.followups) || [],
      photos: parseJsonColumn<PatientPhoto[]>(r.photos) || [],
    };

    return NextResponse.json({ patient });
  } catch (error) {
    console.error("Failed to fetch patient portal profile", error);
    return NextResponse.json({ error: "Database query failed." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json({ error: "Invalid token." }, { status: 400 });
  }

  let body: {
    condition_notes?: unknown;
    priority?: unknown;
    new_followup?: unknown;
    new_photo?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    const db = getDatabase();
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT id, condition_notes, priority, followups, photos FROM patients WHERE access_token = ? LIMIT 1`,
      [token],
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Patient portal link not found." }, { status: 404 });
    }

    const patient = rows[0];
    const patientId = patient.id;

    const updates: string[] = [];
    const updateParams: unknown[] = [];

    if (body.condition_notes !== undefined) {
      if (typeof body.condition_notes !== "string") {
        return NextResponse.json({ error: "Invalid symptom notes." }, { status: 400 });
      }
      const notes = body.condition_notes.trim();
      if (notes.length > MAX_CONDITION_NOTES_LENGTH) {
        return NextResponse.json({ error: "Symptom notes are too long." }, { status: 400 });
      }
      updates.push("condition_notes = ?");
      updateParams.push(notes);
    }

    if (body.priority !== undefined) {
      if (!isPatientPriority(body.priority)) {
        return NextResponse.json({ error: "Invalid priority value." }, { status: 400 });
      }
      updates.push("priority = ?");
      updateParams.push(body.priority);
    }

    if (body.new_followup !== undefined) {
      const result = validateFollowupInput(body.new_followup);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      const existingFollowups =
        parseJsonColumn<FollowupItem[]>(patient.followups) || [];
      updates.push("followups = ?");
      updateParams.push(stringifyJsonColumn([result.value, ...existingFollowups]));
    }

    if (body.new_photo !== undefined) {
      const result = validatePhotoInput(body.new_photo);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      const existingPhotos =
        parseJsonColumn<PatientPhoto[]>(patient.photos) || [];
      updates.push("photos = ?");
      updateParams.push(stringifyJsonColumn([result.value, ...existingPhotos]));
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No update fields provided." }, { status: 400 });
    }

    updateParams.push(patientId);

    await db.query<ResultSetHeader>(
      `UPDATE patients SET ${updates.join(", ")} WHERE id = ?`,
      updateParams,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update patient portal profile", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
