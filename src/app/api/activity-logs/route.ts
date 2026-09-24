import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDatabase, type RowDataPacket } from "@/lib/database";
import { getUserWorkerContext } from "@/lib/worker-auth";

type ActivityLogRow = RowDataPacket & {
  id: string | number;
  actor_worker_id: string | number | null;
  actor_name: string | null;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details_json: string | null;
  ip_address: string | null;
  created_at: string | Date;
};

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseDetails(value: string | null): Record<string, unknown> | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workerContext = await getUserWorkerContext(session.user.email);
  if (!workerContext.isSuperAdmin) {
    return NextResponse.json({ error: "Super admin access is required." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = toText(searchParams.get("search") || "").toLowerCase();
  const action = toText(searchParams.get("action") || "");
  const entityType = toText(searchParams.get("entity_type") || "");
  const limit = Math.min(300, Math.max(20, Number(searchParams.get("limit") || 100)));

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (search) {
    const term = `%${search}%`;
    conditions.push(
      "(LOWER(COALESCE(actor_name, '')) LIKE ? OR LOWER(COALESCE(actor_email, '')) LIKE ? OR LOWER(action) LIKE ? OR LOWER(entity_type) LIKE ? OR LOWER(COALESCE(entity_id, '')) LIKE ?)",
    );
    params.push(term, term, term, term, term);
  }

  if (action) {
    conditions.push("action = ?");
    params.push(action);
  }

  if (entityType) {
    conditions.push("entity_type = ?");
    params.push(entityType);
  }

  let query = `
    SELECT id, actor_worker_id, actor_name, actor_email, actor_role,
           action, entity_type, entity_id, details_json, ip_address, created_at
    FROM activity_logs
  `;

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += " ORDER BY created_at DESC, id DESC LIMIT ?";
  params.push(limit);

  try {
    const [rows] = await getDatabase().query<ActivityLogRow[]>(query, params);

    return NextResponse.json({
      logs: rows.map((row) => ({
        id: String(row.id),
        actor_worker_id: row.actor_worker_id == null ? null : String(row.actor_worker_id),
        actor_name: row.actor_name,
        actor_email: row.actor_email,
        actor_role: row.actor_role,
        action: row.action,
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        details: parseDetails(row.details_json),
        ip_address: row.ip_address,
        created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      })),
    });
  } catch (error) {
    console.error("Failed to load activity logs", error);
    return NextResponse.json(
      { error: "Could not load activity logs. Ensure migration 006 is applied." },
      { status: 503 },
    );
  }
}
