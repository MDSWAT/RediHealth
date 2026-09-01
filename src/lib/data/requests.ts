import type { RowDataPacket } from "mysql2";
import { getDatabase } from "@/lib/database";

/** Number of medical help requests still awaiting triage. */
export async function countPendingRequests(): Promise<number> {
  const db = getDatabase();
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS count FROM medical_help_requests WHERE status = 'pending'`,
  );
  return Number(rows[0]?.count ?? 0);
}
