import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import { auth } from "@/auth";
import { getDatabase } from "@/lib/database";
import { type DBWorkerRow, mapWorkerRow } from "@/lib/data/workers";
import type { CreateWorkerPayload, WorkerStatus } from "@/lib/types/worker";
import { getUserWorkerContext } from "@/lib/worker-auth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isDuplicateEntryError(error: unknown): boolean {
  return (error as { code?: string })?.code === "ER_DUP_ENTRY";
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const searchParam = searchParams.get("search")?.trim().toLowerCase();

  try {
    const db = getDatabase();
    let query = `
      SELECT w.id, w.full_name, w.email, w.phone, w.role, w.department, 
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
      { error: "Could not fetch workers." },
      { status: 500 },
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
      { error: "Only administrators can create worker profiles." },
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
  const status: WorkerStatus = body.status || "active";

  if (!fullName || !emailPattern.test(email)) {
    return NextResponse.json(
      { error: "Please provide a full name and valid email address for the worker." },
      { status: 400 },
    );
  }

  try {
    const db = getDatabase();
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO workers (full_name, email, phone, role, department, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName, email, phone || null, role, department || null, status],
    );

    return NextResponse.json(
      { success: true, id: result.insertId },
      { status: 201 },
    );
  } catch (error) {
    if (isDuplicateEntryError(error)) {
      return NextResponse.json(
        { error: "A worker with this email address already exists." },
        { status: 400 },
      );
    }
    console.error("Failed to create worker", error);
    return NextResponse.json(
      { error: "Could not create worker profile." },
      { status: 500 },
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
      { error: "Only administrators can update worker profiles." },
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

  const id = body.id ? String(body.id) : null;
  if (!id) {
    return NextResponse.json({ error: "Worker ID is required." }, { status: 400 });
  }

  const updates: string[] = [];
  const params: unknown[] = [];

  if (body.full_name !== undefined) {
    updates.push("full_name = ?");
    params.push(text(body.full_name));
  }
  if (body.email !== undefined) {
    updates.push("email = ?");
    params.push(text(body.email).toLowerCase());
  }
  if (body.phone !== undefined) {
    updates.push("phone = ?");
    params.push(text(body.phone) || null);
  }
  if (body.role !== undefined) {
    updates.push("role = ?");
    params.push(text(body.role) || "Healthcare Worker");
  }
  if (body.department !== undefined) {
    updates.push("department = ?");
    params.push(text(body.department) || null);
  }
  if (body.status !== undefined) {
    updates.push("status = ?");
    params.push(body.status);
  }

  const db = getDatabase();

  try {
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
        `UPDATE patients SET assigned_worker_id = ? WHERE id IN (${placeholders})`,
        [id, ...body.assign_patient_ids],
      );
    }

    if (Array.isArray(body.unassign_patient_ids) && body.unassign_patient_ids.length > 0) {
      const placeholders = body.unassign_patient_ids.map(() => "?").join(", ");
      await db.query(
        `UPDATE patients SET assigned_worker_id = NULL WHERE id IN (${placeholders})`,
        body.unassign_patient_ids,
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update worker", error);
    return NextResponse.json(
      { error: "Could not update worker profile." },
      { status: 500 },
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
      { error: "Only administrators can delete worker profiles." },
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
    return NextResponse.json({ error: "Worker ID is required." }, { status: 400 });
  }

  try {
    const db = getDatabase();
    await db.query(`UPDATE patients SET assigned_worker_id = NULL WHERE assigned_worker_id = ?`, [id]);
    const [result] = await db.query<ResultSetHeader>(`DELETE FROM workers WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Worker not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete worker", error);
    return NextResponse.json(
      { error: "Could not delete worker profile." },
      { status: 503 },
    );
  }
}
