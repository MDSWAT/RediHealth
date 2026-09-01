import type { RowDataPacket } from "mysql2";
import { getDatabase } from "@/lib/database";
import type { WorkerItem, WorkerStatus } from "@/lib/types/worker";

export interface DBWorkerRow extends RowDataPacket {
  id: string | number;
  full_name: string;
  email: string;
  phone?: string | null;
  role?: string | null;
  department?: string | null;
  status?: string;
  assigned_patients_count?: number;
  created_at: Date | string;
  updated_at?: Date | string | null;
}

function toIsoString(value: Date | string | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined;
  return value instanceof Date ? value.toISOString() : String(value);
}

export function mapWorkerRow(row: DBWorkerRow): WorkerItem {
  return {
    id: String(row.id),
    full_name: row.full_name,
    email: row.email,
    phone: row.phone || null,
    role: row.role || "Healthcare Worker",
    department: row.department || null,
    status: (row.status as WorkerStatus) || "active",
    assigned_patients_count: Number(row.assigned_patients_count || 0),
    created_at: toIsoString(row.created_at) ?? new Date(0).toISOString(),
    updated_at: toIsoString(row.updated_at),
  };
}

/** Loads workers together with a count of their currently assigned patients. */
export async function loadWorkers(): Promise<WorkerItem[]> {
  const db = getDatabase();
  const [rows] = await db.query<DBWorkerRow[]>(
    `SELECT w.id, w.full_name, w.email, w.phone, w.role, w.department,
            COALESCE(w.status, 'active') AS status,
            COUNT(p.id) AS assigned_patients_count,
            w.created_at, w.updated_at
     FROM workers w
     LEFT JOIN patients p ON p.assigned_worker_id = w.id
     GROUP BY w.id
     ORDER BY w.created_at DESC`,
  );
  return rows.map(mapWorkerRow);
}
