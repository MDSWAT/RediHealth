import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity-log";
import { getCountryDatabase, type ResultSetHeader, type RowDataPacket } from "@/lib/database";
import { parseJsonColumn } from "@/lib/json";
import { type DBWorkerRow, mapWorkerRow } from "@/lib/data/workers";
import { getClientIp } from "@/lib/rate-limit";
import type { CreateWorkerPayload, WorkerStatus } from "@/lib/types/worker";
import { isValidEmail, text } from "@/lib/text";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { isRomanianCounty } from "@/lib/romanian-counties";

function isSuperAdminRole(role: string) {
  const normalized = role.trim().toLowerCase();
  return normalized === "super admin" || normalized === "superadmin";
}

function isWorkerStatus(value: unknown): value is WorkerStatus {
  return value === "active" || value === "inactive";
}

type TargetWorker = { id: string; role: string };

/**
 * Administrators manage staff, but only super admins may touch a super admin account. Otherwise an
 * administrator could take one over by changing its email address, or remove it altogether.
 */
async function loadTargetWorker(
  db: ReturnType<typeof getCountryDatabase>,
  id: string,
  actor: { isSuperAdmin: boolean },
): Promise<{ target: TargetWorker } | { error: NextResponse }> {
  const [rows] = await db.query<DBWorkerRow[]>("SELECT id, role FROM workers WHERE id = ? LIMIT 1", [id]);
  const row = rows[0];
  if (!row) {
    return { error: NextResponse.json({ error: "Staff member not found." }, { status: 404 }) };
  }
  const role = row.role || "";
  if (isSuperAdminRole(role) && !actor.isSuperAdmin) {
    return { error: NextResponse.json({ error: "Only super admins can change a super admin account." }, { status: 403 }) };
  }
  return { target: { id: String(row.id), role } };
}

function needsCounty(role: string) {
  return ["mediator", "doctor", "general practitioner"].includes(role.trim().toLowerCase());
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
  const searchParam = searchParams.get("search")?.trim().toLowerCase();

  try {
    const db = getCountryDatabase(workerContext.country);
    let query = `
      SELECT w.id, w.full_name, w.email, w.phone, w.role, w.department, w.county,
             COALESCE(w.status, 'active') AS status,
             COUNT(p.id) AS assigned_patients_count,
             w.created_at, w.updated_at
      FROM workers w
      LEFT JOIN patients p ON p.assigned_worker_id = w.id
    `;
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (statusParam && statusParam !== "all") {
      conditions.push("w.status = ?");
      params.push(statusParam);
    }

    if (searchParam) {
      conditions.push(
        "(LOWER(w.full_name) LIKE ? OR LOWER(w.email) LIKE ? OR w.phone LIKE ? OR LOWER(w.role) LIKE ? OR LOWER(w.department) LIKE ?)",
      );
      const term = `%${searchParam}%`;
      params.push(term, term, term, term, term);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` GROUP BY w.id ORDER BY w.created_at DESC LIMIT 100`;

    const [rows] = await db.query<DBWorkerRow[]>(query, params);
    return NextResponse.json({ workers: rows.map(mapWorkerRow) });
  } catch (error) {
    console.error("Failed to fetch workers", error);
    return NextResponse.json(
      { error: "Could not fetch workers. Ensure migration 012 is applied." },
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
  if (!workerContext.isAdmin) {
    return NextResponse.json(
      { error: "Only administrators can add staff." },
      { status: 403 },
    );
  }

  let body: CreateWorkerPayload;

  try {
    body = (await request.json()) as CreateWorkerPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const fullName = text(body.full_name);
  const email = text(body.email).toLowerCase();
  const phone = text(body.phone);
  const role = text(body.role) || "Healthcare Worker";
  const department = text(body.department);
  const county = workerContext.country === "RO" ? text(body.county) : "";
  if (body.status !== undefined && !isWorkerStatus(body.status)) {
    return NextResponse.json({ error: "Invalid staff status." }, { status: 400 });
  }
  const status: WorkerStatus = body.status ?? "active";

  if (!fullName || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "Enter a full name and a valid email." },
      { status: 400 },
    );
  }

  if (fullName.length > 200 || email.length > 320 || phone.length > 50 || role.length > 100 || department.length > 100) {
    return NextResponse.json(
      { error: "One or more fields are too long." },
      { status: 400 },
    );
  }

  if (isSuperAdminRole(role) && !workerContext.isSuperAdmin) {
    return NextResponse.json(
      { error: "Only super admins can create super admin users." },
      { status: 403 },
    );
  }

  if (workerContext.country === "RO" && needsCounty(role) && !isRomanianCounty(county)) {
    return NextResponse.json({ error: "Choose a valid county for this staff member." }, { status: 400 });
  }

  try {
    const db = getCountryDatabase(workerContext.country);
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO workers (full_name, email, phone, role, department, county, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fullName, email, phone || null, role, department || null, county || null, status],
    );

    if (!result.insertId) {
      return NextResponse.json(
        { error: "The staff member was saved, but the database returned no ID." },
        { status: 503 },
      );
    }

    await logActivity({
      country: workerContext.country,
      actorWorkerId: workerContext.workerId,
      actorName: workerContext.workerName,
      actorEmail: text(session.user.email),
      actorRole: workerContext.role,
      action: "worker.created",
      entityType: "worker",
      entityId: result.insertId,
      details: {
        full_name: fullName,
        email,
        role,
        department: department || null,
        county: county || null,
        status,
      },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json(
      { success: true, id: result.insertId },
      { status: 201 },
    );
  } catch (error) {
    if (isDuplicateEntryError(error)) {
      return NextResponse.json(
        { error: "A staff member with this email already exists." },
        { status: 400 },
      );
    }
    console.error("Failed to create worker", error);
    return NextResponse.json(
      { error: "Could not add the staff member." },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workerContext = await getUserWorkerContext(session.user.email);
  if (!workerContext.isAdmin) {
    return NextResponse.json(
      { error: "Only administrators can edit staff." },
      { status: 403 },
    );
  }

  let body: Partial<CreateWorkerPayload> & {
    id?: string | number;
    assign_patient_ids?: (string | number)[];
    unassign_patient_ids?: (string | number)[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }
  const id = body.id ? String(body.id) : null;
  if (!id) {
    return NextResponse.json({ error: "Staff ID is required." }, { status: 400 });
  }

  const updates: string[] = [];
  const params: unknown[] = [];

  const isSelf = id === workerContext.workerId;

  if (body.full_name !== undefined) {
    const nextFullName = text(body.full_name);
    if (!nextFullName || nextFullName.length > 200) {
      return NextResponse.json({ error: "Enter a full name (max 200 characters)." }, { status: 400 });
    }
    updates.push("full_name = ?");
    params.push(nextFullName);
  }
  if (body.email !== undefined) {
    const nextEmail = text(body.email).toLowerCase();
    if (!isValidEmail(nextEmail)) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }
    updates.push("email = ?");
    params.push(nextEmail);
  }
  if (body.phone !== undefined) {
    const nextPhone = text(body.phone);
    if (nextPhone.length > 50) {
      return NextResponse.json({ error: "The phone number is too long." }, { status: 400 });
    }
    updates.push("phone = ?");
    params.push(nextPhone || null);
  }
  if (body.role !== undefined) {
    const nextRole = text(body.role) || "Healthcare Worker";
    if (nextRole.length > 100) {
      return NextResponse.json({ error: "The role is too long." }, { status: 400 });
    }
    if (isSuperAdminRole(nextRole) && !workerContext.isSuperAdmin) {
      return NextResponse.json(
        { error: "Only super admins can assign the super admin role." },
        { status: 403 },
      );
    }
    updates.push("role = ?");
    params.push(nextRole);
  }
  if (body.department !== undefined) {
    const nextDepartment = text(body.department);
    if (nextDepartment.length > 100) {
      return NextResponse.json({ error: "The department is too long." }, { status: 400 });
    }
    updates.push("department = ?");
    params.push(nextDepartment || null);
  }
  if (body.county !== undefined) {
    const county = workerContext.country === "RO" ? text(body.county) : "";
    if (county && !isRomanianCounty(county)) {
      return NextResponse.json({ error: "Choose a valid county for this staff member." }, { status: 400 });
    }
    updates.push("county = ?");
    params.push(county || null);
  }
  if (body.status !== undefined) {
    if (!isWorkerStatus(body.status)) {
      return NextResponse.json({ error: "Invalid staff status." }, { status: 400 });
    }
    // Deactivating your own account would lock you out with no way back in.
    if (isSelf && body.status !== "active") {
      return NextResponse.json({ error: "You cannot deactivate your own account." }, { status: 400 });
    }
    updates.push("status = ?");
    params.push(body.status);
  }

  const db = getCountryDatabase(workerContext.country);

  try {
    const loaded = await loadTargetWorker(db, id, workerContext);
    if ("error" in loaded) return loaded.error;

    const changedFields = updates
      .map((entry) => entry.split("=")[0]?.trim())
      .filter(Boolean);

    if (updates.length > 0) {
      params.push(id);
      await db.query<ResultSetHeader>(
        `UPDATE workers SET ${updates.join(", ")} WHERE id = ?`,
        params,
      );
    }

    if (Array.isArray(body.assign_patient_ids) && body.assign_patient_ids.length > 0) {
      const placeholders = body.assign_patient_ids.map(() => "?").join(", ");
      await db.query(
        `UPDATE patients SET assigned_worker_id = ?, assigned_worker_ids = JSON_ARRAY(?) WHERE id IN (${placeholders})`,
        [id, id, ...body.assign_patient_ids],
      );
    }

    if (Array.isArray(body.unassign_patient_ids) && body.unassign_patient_ids.length > 0) {
      const placeholders = body.unassign_patient_ids.map(() => "?").join(", ");
      await db.query(
        `UPDATE patients SET assigned_worker_id = NULL, assigned_worker_ids = NULL WHERE id IN (${placeholders})`,
        body.unassign_patient_ids,
      );
    }

    await logActivity({
      country: workerContext.country,
      actorWorkerId: workerContext.workerId,
      actorName: workerContext.workerName,
      actorEmail: text(session.user.email),
      actorRole: workerContext.role,
      action: "worker.updated",
      entityType: "worker",
      entityId: id,
      details: {
        updated_fields: changedFields,
        assigned_patient_ids: body.assign_patient_ids || [],
        unassigned_patient_ids: body.unassign_patient_ids || [],
      },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isDuplicateEntryError(error)) {
      return NextResponse.json(
        { error: "A staff member with this email already exists." },
        { status: 400 },
      );
    }
    console.error("Failed to update worker", error);
    return NextResponse.json(
      { error: "Could not update the staff member." },
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
  if (!workerContext.isAdmin) {
    return NextResponse.json(
      { error: "Only administrators can delete staff." },
      { status: 403 },
    );
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
    return NextResponse.json({ error: "Staff ID is required." }, { status: 400 });
  }
  if (id === workerContext.workerId) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  try {
    const db = getCountryDatabase(workerContext.country);
    const loaded = await loadTargetWorker(db, id, workerContext);
    if ("error" in loaded) return loaded.error;
    const [existingRows] = await db.query<DBWorkerRow[]>(
      `SELECT id, full_name, email, role FROM workers WHERE id = ? LIMIT 1`,
      [id],
    );
    const existing = existingRows[0];
    if (!existing) {
      return NextResponse.json({ error: "Staff member not found." }, { status: 404 });
    }

    // Meetings and mediator cases keep a required link to the staff member who created them, so
    // the database refuses the delete. Say so clearly instead of failing with a generic error.
    const [linkedRows] = await db.query<(RowDataPacket & { meetings: number; cases: number })[]>(
      `SELECT (SELECT COUNT(*) FROM meetings WHERE organizer_worker_id = ?) AS meetings,
              (SELECT COUNT(*) FROM mediator_cases WHERE mediator_worker_id = ?) AS cases`,
      [id, id],
    );
    if (Number(linkedRows[0]?.meetings || 0) > 0 || Number(linkedRows[0]?.cases || 0) > 0) {
      return NextResponse.json(
        { error: "This staff member has meetings or cases on record. Set the account to inactive instead of deleting it." },
        { status: 409 },
      );
    }

    const connection = await db.getConnection();
    let deleted = false;
    try {
      await connection.beginTransaction();
      // Remove the worker from every patient's assignment list, not only the primary assignment.
      const [assignedRows] = await connection.query<(RowDataPacket & { id: number; assigned_worker_ids: unknown })[]>(
        `SELECT id, assigned_worker_ids FROM patients
         WHERE assigned_worker_id = ? OR assigned_worker_ids LIKE ?
         FOR UPDATE`,
        [id, `%"${id}"%`],
      );
      for (const patient of assignedRows) {
        const remaining = (parseJsonColumn<Array<string | number>>(patient.assigned_worker_ids) || [])
          .map(String)
          .filter((workerId) => workerId !== id);
        await connection.query(
          "UPDATE patients SET assigned_worker_id = ?, assigned_worker_ids = ? WHERE id = ?",
          [remaining[0] ?? null, remaining.length > 0 ? JSON.stringify(remaining) : null, patient.id],
        );
      }
      const [result] = await connection.query<ResultSetHeader>("DELETE FROM workers WHERE id = ?", [id]);
      deleted = result.affectedRows > 0;
      await connection.commit();
    } catch (error) {
      await connection.rollback().catch(() => undefined);
      throw error;
    } finally {
      connection.release();
    }

    if (!deleted) {
      return NextResponse.json({ error: "Staff member not found." }, { status: 404 });
    }

    await logActivity({
      country: workerContext.country,
      actorWorkerId: workerContext.workerId,
      actorName: workerContext.workerName,
      actorEmail: text(session.user.email),
      actorRole: workerContext.role,
      action: "worker.deleted",
      entityType: "worker",
      entityId: id,
      details: {
        full_name: existing.full_name,
        email: existing.email,
        role: existing.role,
      },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete worker", error);
    return NextResponse.json(
      { error: "Could not delete the staff member." },
      { status: 503 },
    );
  }
}
