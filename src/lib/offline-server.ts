import { createHash } from "node:crypto";
import { auth } from "@/auth";
import { getUserWorkerContext } from "./worker-auth";
import { getCountryDatabase, type RowDataPacket } from "./database";
import type { OfflineIdentity } from "./offline-types";

export async function offlineIdentity(): Promise<OfflineIdentity | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const context = await getUserWorkerContext(session.user.email);
  if (!context.workerId || context.lookupFailed || context.isAdmin || !["doctor", "mediator"].includes(context.role.toLowerCase())) return null;
  return { email: session.user.email.toLowerCase(), workerId: context.workerId, workerName: context.workerName || "", role: context.role, country: context.country };
}

export function recordRevision(row: RowDataPacket): string {
  return createHash("sha256").update(JSON.stringify(Object.keys(row).sort().map((key) => [key, row[key]]))).digest("hex");
}

export async function offlineRecord(identity: OfflineIdentity, entity: "patient" | "request", id: string, lock = false) {
  const table = entity === "patient" ? "patients" : "medical_help_requests";
  const [rows] = await getCountryDatabase(identity.country).query<RowDataPacket[]>(
    `SELECT * FROM ${table} WHERE id = ?${entity === "patient" ? ` AND (assigned_worker_id = ? OR FIND_IN_SET(?, REPLACE(REPLACE(REPLACE(COALESCE(assigned_worker_ids, '[]'), '[', ''), ']', ''), '"', '')) > 0)` : ""}${lock ? " FOR UPDATE" : ""}`,
    entity === "patient" ? [id, identity.workerId, identity.workerId] : [id],
  );
  return rows[0] || null;
}
