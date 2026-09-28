import {
  getDatabase,
  type ResultSetHeader,
  type RowDataPacket,
} from "@/lib/database";

export type ActivityLogInput = {
  actorWorkerId?: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | number | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
};

type Queryable = {
  query<T extends RowDataPacket[] | ResultSetHeader>(
    sql: string,
    params?: unknown[],
  ): Promise<[T, undefined]>;
};

function stringifyDetails(details: Record<string, unknown> | null | undefined) {
  if (!details) return null;
  try {
    const json = JSON.stringify(details);
    // Keep audit rows compact and resilient to unusually large payloads.
    return json.length > 64_000 ? json.slice(0, 64_000) : json;
  } catch {
    return null;
  }
}

export async function logActivity(
  input: ActivityLogInput,
  queryable?: Queryable,
): Promise<boolean> {
  const db = queryable ?? getDatabase();

  try {
    await db.query<ResultSetHeader>(
      `INSERT INTO activity_logs (
         actor_worker_id,
         actor_name,
         actor_email,
         actor_role,
         action,
         entity_type,
         entity_id,
         details_json,
         ip_address
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.actorWorkerId ?? null,
        input.actorName ?? null,
        input.actorEmail ?? null,
        input.actorRole ?? null,
        input.action,
        input.entityType,
        input.entityId == null ? null : String(input.entityId),
        stringifyDetails(input.details),
        input.ipAddress ?? null,
      ],
    );

    return true;
  } catch (error) {
    console.error("Failed to write activity log", error);
    return false;
  }
}
