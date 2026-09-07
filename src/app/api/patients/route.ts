import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDatabase, type ResultSetHeader } from "@/lib/database";
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
const DEFAULT_PORTAL_TOKEN_TTL_DAYS = 30;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isDuplicateEntryError(error: unknown): boolean {
  const dbError = error as { code?: string; errno?: number; sqlState?: string; message?: string };
  return (
    dbError.code === "ER_DUP_ENTRY"
    || dbError.errno === 1062
    || dbError.sqlState === "23000"
    || /duplicate entry/i.test(dbError.message || "")
  );
}

function normalizeWorkerIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value
    .map((item) => (item == null ? "" : String(item).trim()))
    .filter((item) => item.length > 0))];
}

function resolvePortalTokenExpiryDate() {
  const configuredTtlDays = Number(process.env.PATIENT_PORTAL_TOKEN_TTL_DAYS || DEFAULT_PORTAL_TOKEN_TTL_DAYS);
  const ttlDays = Number.isFinite(configuredTtlDays) && configuredTtlDays > 0
    ? configuredTtlDays
    : DEFAULT_PORTAL_TOKEN_TTL_DAYS;
  return new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workerContext = await getUserWorkerContext(session.user.email);
  if (!workerContext.workerId) {
    return NextResponse.json({ error: "Staff access is required." }, { status: 403 });
  }

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
      conditions.push("(p.assigned_worker_id = ? OR FIND_IN_SET(?, REPLACE(REPLACE(REPLACE(COALESCE(p.assigned_worker_ids, '[]'), '[', ''), ']', ''), '\"', '')) > 0)");
      params.push(workerContext.workerId, workerContext.workerId);
    } else if (workerIdParam && workerIdParam !== "all") {
      if (workerIdParam === "unassigned") {
        conditions.push("(p.assigned_worker_id IS NULL AND (p.assigned_worker_ids IS NULL OR JSON_LENGTH(p.assigned_worker_ids) = 0))");
      } else {
        conditions.push("(p.assigned_worker_id = ? OR FIND_IN_SET(?, REPLACE(REPLACE(REPLACE(COALESCE(p.assigned_worker_ids, '[]'), '[', ''), ']', ''), '\"', '')) > 0)");
        params.push(workerIdParam, workerIdParam);
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
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workerContext = await getUserWorkerContext(session.user.email);
  if (!workerContext.workerId) {
    return NextResponse.json({ error: "Staff access is required." }, { status: 403 });
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
  const requestedAssignedWorkerIds = normalizeWorkerIds(body.assigned_worker_ids);
  const requestedAssignedWorkerId = body.assigned_worker_id
    ? String(body.assigned_worker_id)
    : requestedAssignedWorkerIds[0] || null;
  const accessToken = body.access_token || randomUUID().replace(/-/g, "");
  const accessTokenExpiresAt = resolvePortalTokenExpiryDate();

  if (!fullName || !phone || !emailPattern.test(email)) {
    return NextResponse.json(
      { error: "Please provide patient name, phone, and a valid email address." },
      { status: 400 },
    );
  }

  if (
    fullName.length > 200 ||
    phone.length > 50 ||
    email.length > 320 ||
    address.length > 500
  ) {
    return NextResponse.json(
      { error: "One or more fields are too long." },
      { status: 400 },
    );
  }

  if (body.status !== undefined && !isPatientStatus(body.status)) {
    return NextResponse.json({ error: "Invalid patient status." }, { status: 400 });
  }
  if (body.priority !== undefined && !isPatientPriority(body.priority)) {
    return NextResponse.json({ error: "Invalid patient priority." }, { status: 400 });
  }

  if (!workerContext.isAdmin) {
    const assignsOtherWorker =
      (requestedAssignedWorkerId && requestedAssignedWorkerId !== workerContext.workerId) ||
      requestedAssignedWorkerIds.some((workerId) => workerId !== workerContext.workerId);

    if (assignsOtherWorker) {
      return NextResponse.json(
        { error: "Only administrators can assign patients to other workers." },
        { status: 403 },
      );
    }
  }

  const status: PatientStatus = body.status ?? "active";
  const priority: PatientPriority = body.priority ?? "moderate";
  const treatmentPlan = stringifyJsonColumn(body.treatment_plan);
  const followups = stringifyJsonColumn(body.followups);
  const photos = stringifyJsonColumn(body.photos);
  const assignedWorkerIds = workerContext.isAdmin
    ? requestedAssignedWorkerIds
    : [workerContext.workerId];
  const assignedWorkerId = workerContext.isAdmin
    ? requestedAssignedWorkerId
    : workerContext.workerId;
  let createdPatientId: number | undefined;

  try {
    const db = getDatabase();
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO patients (request_id, assigned_worker_id, assigned_worker_ids, access_token, access_token_expires_at, full_name, phone, email, date_of_birth, gender, address, condition_notes, medical_history, treatment_plan, followups, photos, status, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        requestId,
        assignedWorkerId ?? workerContext.workerId,
        stringifyJsonColumn(assignedWorkerIds.length > 0 ? assignedWorkerIds : null),
        accessToken,
        accessTokenExpiresAt,
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
    createdPatientId = result.insertId;
  } catch (error) {
    if (isDuplicateEntryError(error)) {
      return NextResponse.json(
        { error: "A patient with this email or portal token already exists." },
        { status: 409 },
      );
    }
    console.error("Failed to create patient profile", error);
    return NextResponse.json(
      { error: "Could not create patient profile. Ensure migrations 003–007 are applied." },
      { status: 503 },
    );
  }

  try {
    await sendPatientPortalLinkEmail({
      name: fullName,
      email,
      accessToken,
      treatmentPlan: parseJsonColumn<TreatmentPlan>(treatmentPlan),
      conditionNotes,
    });
  } catch (error) {
    console.error("Failed to send patient portal link email", error);
    return NextResponse.json(
      {
        success: true,
        id: createdPatientId,
        access_token: accessToken,
        email_sent: false,
        warning: "Patient was created, but portal email could not be sent.",
      },
      { status: 201 },
    );
  }

  return NextResponse.json(
    { success: true, id: createdPatientId, access_token: accessToken, email_sent: true },
    { status: 201 },
  );
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workerContext = await getUserWorkerContext(session.user.email);
  if (!workerContext.workerId) {
    return NextResponse.json({ error: "Staff access is required." }, { status: 403 });
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
    const nextFullName = text(body.full_name);
    if (!nextFullName) {
      return NextResponse.json({ error: "Patient name cannot be empty." }, { status: 400 });
    }
    if (nextFullName.length > 200) {
      return NextResponse.json({ error: "Patient name is too long." }, { status: 400 });
    }
    updates.push("full_name = ?");
    params.push(nextFullName);
  }
  if (body.phone !== undefined) {
    const nextPhone = text(body.phone);
    if (!nextPhone) {
      return NextResponse.json({ error: "Patient phone cannot be empty." }, { status: 400 });
    }
    if (nextPhone.length > 50) {
      return NextResponse.json({ error: "Patient phone is too long." }, { status: 400 });
    }
    updates.push("phone = ?");
    params.push(nextPhone);
  }
  if (body.email !== undefined) {
    const nextEmail = text(body.email).toLowerCase();
    if (!emailPattern.test(nextEmail)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }
    if (nextEmail.length > 320) {
      return NextResponse.json({ error: "Patient email is too long." }, { status: 400 });
    }
    updates.push("email = ?");
    params.push(nextEmail);
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
    const nextAddress = text(body.address);
    if (nextAddress.length > 500) {
      return NextResponse.json({ error: "Patient address is too long." }, { status: 400 });
    }
    updates.push("address = ?");
    params.push(nextAddress || null);
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
    if (!workerContext.isAdmin) {
      return NextResponse.json(
        { error: "Only administrators can change patient assignments." },
        { status: 403 },
      );
    }

    const nextAssignedWorkerId = body.assigned_worker_id ? String(body.assigned_worker_id) : null;
    updates.push("assigned_worker_id = ?");
    params.push(nextAssignedWorkerId);
    updates.push("assigned_worker_ids = ?");
    params.push(stringifyJsonColumn(nextAssignedWorkerId ? [nextAssignedWorkerId] : null));
  }
  if (body.assigned_worker_ids !== undefined) {
    if (!workerContext.isAdmin) {
      return NextResponse.json(
        { error: "Only administrators can change patient assignments." },
        { status: 403 },
      );
    }

    const nextAssignedWorkerIds = normalizeWorkerIds(body.assigned_worker_ids);
    updates.push("assigned_worker_ids = ?");
    params.push(stringifyJsonColumn(nextAssignedWorkerIds.length > 0 ? nextAssignedWorkerIds : null));
    updates.push("assigned_worker_id = ?");
    params.push(nextAssignedWorkerIds[0] || null);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  params.push(id);

  // Non-admins may only update patients assigned to them.
  let whereClause = "id = ?";
  if (!workerContext.isAdmin) {
    whereClause += " AND (assigned_worker_id = ? OR FIND_IN_SET(?, REPLACE(REPLACE(REPLACE(COALESCE(assigned_worker_ids, '[]'), '[', ''), ']', ''), '\"', '')) > 0)";
    params.push(workerContext.workerId, workerContext.workerId);
  }

  try {
    const [result] = await getDatabase().query<ResultSetHeader>(
      `UPDATE patients SET ${updates.join(", ")} WHERE ${whereClause}`,
      params,
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Patient not found or not assigned to you." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isDuplicateEntryError(error)) {
      return NextResponse.json(
        { error: "A patient with this email already exists." },
        { status: 409 },
      );
    }
    console.error("Failed to update patient profile", error);
    return NextResponse.json(
      { error: "Could not update patient profile." },
      { status: 503 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workerContext = await getUserWorkerContext(session.user.email);
  if (!workerContext.workerId) {
    return NextResponse.json({ error: "Staff access is required." }, { status: 403 });
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

  // Non-admins may only delete patients assigned to them.
  let whereClause = "id = ?";
  const deleteParams: unknown[] = [id];
  if (!workerContext.isAdmin) {
    whereClause += " AND (assigned_worker_id = ? OR FIND_IN_SET(?, REPLACE(REPLACE(REPLACE(COALESCE(assigned_worker_ids, '[]'), '[', ''), ']', ''), '\"', '')) > 0)";
    deleteParams.push(workerContext.workerId, workerContext.workerId);
  }

  try {
    const [result] = await getDatabase().query<ResultSetHeader>(
      `DELETE FROM patients WHERE ${whereClause}`,
      deleteParams,
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Patient not found or not assigned to you." }, { status: 404 });
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
