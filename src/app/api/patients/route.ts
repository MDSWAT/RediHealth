import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import { auth } from "@/auth";
import { getDatabase } from "@/lib/database";
import { parseJsonColumn, stringifyJsonColumn } from "@/lib/json";
import {
  PATIENT_COLUMNS,
  PATIENT_FROM,
  mapPatientRow,
  type DBPatientRow,
} from "@/lib/data/patients";
import { isPatientPriority, isPatientStatus } from "@/lib/validation";
import type {
  CreatePatientPayload,
  PatientPriority,
  PatientStatus,
  TreatmentPlan,
} from "@/lib/types/patient";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { sendPatientPortalLinkEmail } from "@/lib/email";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workerContext = await getUserWorkerContext(session.user.email);

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const priorityParam = searchParams.get("priority");
  const workerIdParam = searchParams.get("assigned_worker_id");
  const searchParam = searchParams.get("search")?.trim().toLowerCase();

  try {
    const db = getDatabase();
    let query = `SELECT ${PATIENT_COLUMNS} ${PATIENT_FROM}`;
    const params: unknown[] = [];
    const conditions: string[] = [];

    // Non-admins may only ever see patients assigned to them.
    if (!workerContext.isAdmin && workerContext.workerId) {
      conditions.push("p.assigned_worker_id = ?");
      params.push(workerContext.workerId);
    } else if (workerIdParam && workerIdParam !== "all") {
      if (workerIdParam === "unassigned") {
        conditions.push("p.assigned_worker_id IS NULL");
      } else {
        conditions.push("p.assigned_worker_id = ?");
        params.push(workerIdParam);
      }
    }

    if (statusParam && statusParam !== "all") {
      conditions.push("p.status = ?");
      params.push(statusParam);
    }

    if (priorityParam && priorityParam !== "all") {
      conditions.push("p.priority = ?");
      params.push(priorityParam);
    }

    if (searchParam) {
      conditions.push(
        "(LOWER(p.full_name) LIKE ? OR LOWER(p.email) LIKE ? OR p.phone LIKE ? OR LOWER(p.condition_notes) LIKE ? OR LOWER(w.full_name) LIKE ?)",
      );
      const term = `%${searchParam}%`;
      params.push(term, term, term, term, term);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY p.created_at DESC LIMIT 100`;

    const [rows] = await db.query<DBPatientRow[]>(query, params);
    return NextResponse.json({ patients: rows.map(mapPatientRow) });
  } catch (error) {
    console.error("Failed to fetch patients", error);
    return NextResponse.json(
      { error: "Could not fetch patients. Ensure migrations 003–007 are applied." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: CreatePatientPayload;

  try {
    body = (await request.json()) as CreatePatientPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const fullName = text(body.full_name);
  const phone = text(body.phone);
  const email = text(body.email).toLowerCase();
  const dateOfBirth = text(body.date_of_birth);
  const gender = text(body.gender);
  const address = text(body.address);
  const conditionNotes = text(body.condition_notes);
  const medicalHistory = text(body.medical_history);
  const requestId = body.request_id ? String(body.request_id) : null;
  const assignedWorkerId = body.assigned_worker_id ? String(body.assigned_worker_id) : null;
  const accessToken = body.access_token || randomUUID().replace(/-/g, "");

  if (!fullName || !phone || !emailPattern.test(email)) {
    return NextResponse.json(
      { error: "Please provide patient name, phone, and a valid email address." },
      { status: 400 },
    );
  }

  if (body.status !== undefined && !isPatientStatus(body.status)) {
    return NextResponse.json({ error: "Invalid patient status." }, { status: 400 });
  }
  if (body.priority !== undefined && !isPatientPriority(body.priority)) {
    return NextResponse.json({ error: "Invalid patient priority." }, { status: 400 });
  }

  const status: PatientStatus = body.status ?? "active";
  const priority: PatientPriority = body.priority ?? "moderate";
  const treatmentPlan = stringifyJsonColumn(body.treatment_plan);
  const followups = stringifyJsonColumn(body.followups);
  const photos = stringifyJsonColumn(body.photos);

  try {
    const db = getDatabase();
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO patients (request_id, assigned_worker_id, access_token, full_name, phone, email, date_of_birth, gender, address, condition_notes, medical_history, treatment_plan, followups, photos, status, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        requestId,
        assignedWorkerId,
        accessToken,
        fullName,
        phone,
        email,
        dateOfBirth || null,
        gender || null,
        address || null,
        conditionNotes || null,
        medicalHistory || null,
        treatmentPlan,
        followups,
        photos,
        status,
        priority,
      ],
    );

    await sendPatientPortalLinkEmail({
      name: fullName,
      email,
      accessToken,
      treatmentPlan: parseJsonColumn<TreatmentPlan>(treatmentPlan),
      conditionNotes,
    });

    return NextResponse.json(
      { success: true, id: result.insertId, access_token: accessToken },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create patient profile", error);
    return NextResponse.json(
      { error: "Could not create patient profile. Ensure migrations 003–007 are applied." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: Partial<CreatePatientPayload> & { id?: string | number };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const id = body.id ? String(body.id) : null;
  if (!id) {
    return NextResponse.json({ error: "Patient ID is required." }, { status: 400 });
  }

  if (body.status !== undefined && !isPatientStatus(body.status)) {
    return NextResponse.json({ error: "Invalid patient status." }, { status: 400 });
  }
  if (body.priority !== undefined && !isPatientPriority(body.priority)) {
    return NextResponse.json({ error: "Invalid patient priority." }, { status: 400 });
  }

  const updates: string[] = [];
  const params: unknown[] = [];

  if (body.full_name !== undefined) {
    updates.push("full_name = ?");
    params.push(text(body.full_name));
  }
  if (body.phone !== undefined) {
    updates.push("phone = ?");
    params.push(text(body.phone));
  }
  if (body.email !== undefined) {
    updates.push("email = ?");
    params.push(text(body.email).toLowerCase());
  }
  if (body.date_of_birth !== undefined) {
    updates.push("date_of_birth = ?");
    params.push(text(body.date_of_birth) || null);
  }
  if (body.gender !== undefined) {
    updates.push("gender = ?");
    params.push(text(body.gender) || null);
  }
  if (body.address !== undefined) {
    updates.push("address = ?");
    params.push(text(body.address) || null);
  }
  if (body.condition_notes !== undefined) {
    updates.push("condition_notes = ?");
    params.push(text(body.condition_notes) || null);
  }
  if (body.medical_history !== undefined) {
    updates.push("medical_history = ?");
    params.push(text(body.medical_history) || null);
  }
  if (body.treatment_plan !== undefined) {
    updates.push("treatment_plan = ?");
    params.push(stringifyJsonColumn(body.treatment_plan));
  }
  if (body.followups !== undefined) {
    updates.push("followups = ?");
    params.push(stringifyJsonColumn(body.followups));
  }
  if (body.photos !== undefined) {
    updates.push("photos = ?");
    params.push(stringifyJsonColumn(body.photos));
  }
  if (body.status !== undefined) {
    updates.push("status = ?");
    params.push(body.status);
  }
  if (body.priority !== undefined) {
    updates.push("priority = ?");
    params.push(body.priority);
  }
  if (body.assigned_worker_id !== undefined) {
    updates.push("assigned_worker_id = ?");
    params.push(body.assigned_worker_id ? String(body.assigned_worker_id) : null);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  params.push(id);

  try {
    const [result] = await getDatabase().query<ResultSetHeader>(
      `UPDATE patients SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update patient profile", error);
    return NextResponse.json(
      { error: "Could not update patient profile." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  let id = searchParams.get("id");

  if (!id) {
    // The id may arrive as a query parameter or in a JSON body.
    try {
      const body = (await request.json()) as { id?: string | number };
      if (body.id) {
        id = String(body.id);
      }
    } catch {
      // No JSON body provided; the missing-id check below handles it.
    }
  }

  if (!id) {
    return NextResponse.json({ error: "Patient ID is required." }, { status: 400 });
  }

  try {
    const [result] = await getDatabase().query<ResultSetHeader>(
      `DELETE FROM patients WHERE id = ?`,
      [id],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete patient profile", error);
    return NextResponse.json(
      { error: "Could not delete patient profile." },
      { status: 503 },
    );
  }
}
