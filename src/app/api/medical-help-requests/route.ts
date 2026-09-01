import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { auth } from "@/auth";
import { getDatabase } from "@/lib/database";
import { sendHelpRequestConfirmationEmail } from "@/lib/email";
import type { RequestStatus, RequestPriority } from "@/lib/types/medical-request";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RequestPayload = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  description?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: RequestPayload;

  try {
    body = (await request.json()) as RequestPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request data." }, { status: 400 });
  }

  const name = text(body.name);
  const phone = text(body.phone);
  const email = text(body.email).toLowerCase();
  const description = text(body.description);

  if (!phone || !emailPattern.test(email) || description.length < 10) {
    return NextResponse.json(
      { error: "Please provide a phone number, valid email, and description." },
      { status: 400 },
    );
  }

  if (
    name.length > 200 ||
    phone.length > 50 ||
    email.length > 320 ||
    description.length > 4000
  ) {
    return NextResponse.json(
      { error: "One or more fields are too long." },
      { status: 400 },
    );
  }

  try {
    await getDatabase().query(
      `INSERT INTO medical_help_requests (full_name, phone, email, description)
       VALUES (?, ?, ?, ?)`,
      [name || null, phone, email, description],
    );
  } catch (error) {
    console.error("Failed to store medical help request", error);
    return NextResponse.json(
      { error: "We could not save your request. Please try again." },
      { status: 503 },
    );
  }

  await sendHelpRequestConfirmationEmail({
    name,
    phone,
    email,
    description,
  });

  return NextResponse.json({ success: true }, { status: 201 });
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
    let query = `SELECT id, full_name, phone, email, description, 
                  COALESCE(status, 'pending') AS status, 
                  COALESCE(priority, 'normal') AS priority, 
                  internal_notes, created_at, updated_at
                 FROM medical_help_requests`;
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (statusParam && statusParam !== "all") {
      conditions.push("status = ?");
      params.push(statusParam);
    }

    if (searchParam) {
      conditions.push("(LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ? OR LOWER(description) LIKE ?)");
      const term = `%${searchParam}%`;
      params.push(term, term, term, term);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY created_at DESC LIMIT 100`;

    const [rows] = await db.query<RowDataPacket[]>(query, params);
    return NextResponse.json({ requests: rows });
  } catch (error) {
    console.error("Failed to fetch medical help requests", error);
    return NextResponse.json(
      { error: "Could not fetch requests." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: {
    id?: string | number;
    status?: RequestStatus;
    priority?: RequestPriority;
    internal_notes?: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const id = body.id ? String(body.id) : null;
  if (!id) {
    return NextResponse.json({ error: "Request ID is required." }, { status: 400 });
  }

  const validStatuses: RequestStatus[] = ["pending", "in_progress", "resolved", "archived"];
  const validPriorities: RequestPriority[] = ["normal", "urgent"];

  const updates: string[] = [];
  const params: unknown[] = [];

  if (body.status !== undefined) {
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }
    updates.push("status = ?");
    params.push(body.status);
  }

  if (body.priority !== undefined) {
    if (!validPriorities.includes(body.priority)) {
      return NextResponse.json({ error: "Invalid priority value." }, { status: 400 });
    }
    updates.push("priority = ?");
    params.push(body.priority);
  }

  if (body.internal_notes !== undefined) {
    updates.push("internal_notes = ?");
    params.push(body.internal_notes);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "No update fields provided." }, { status: 400 });
  }

  params.push(id);

  try {
    const [result] = await getDatabase().query<ResultSetHeader>(
      `UPDATE medical_help_requests SET ${updates.join(", ")} WHERE id = ?`,
      params,
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update medical help request", error);
    return NextResponse.json(
      { error: "Could not update request. Ensure database migration 002 is applied." },
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
    return NextResponse.json({ error: "Request ID is required." }, { status: 400 });
  }

  try {
    const [result] = await getDatabase().query<ResultSetHeader>(
      `DELETE FROM medical_help_requests WHERE id = ?`,
      [id],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete medical help request", error);
    return NextResponse.json(
      { error: "We could not delete the request. Please try again." },
      { status: 503 },
    );
  }
}
