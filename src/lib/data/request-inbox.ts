import { getDatabase, type RowDataPacket } from "@/lib/database";
import type { MedicalHelpRequestItem, RequestStatus } from "@/lib/types/medical-request";

import { inboxOptions, type InboxPage, type QueueCounts } from "@/lib/request-inbox";
export type { InboxPage, QueueCounts } from "@/lib/request-inbox";

export async function loadRequestInbox(params: URLSearchParams, workerId: string, isAdmin: boolean): Promise<InboxPage> {
  const options = inboxOptions(params);
  const db = getDatabase();
  const clauses: string[] = [];
  const values: unknown[] = [];
  if (options.id) { clauses.push("r.id = ?"); values.push(options.id); }
  if (options.folder === "attention") clauses.push("COALESCE(r.status, 'pending') IN ('pending', 'in_progress')");
  else if (options.folder !== "all") { clauses.push("COALESCE(r.status, 'pending') = ?"); values.push(options.folder); }
  if (options.search) {
    clauses.push("(LOWER(r.full_name) LIKE ? OR LOWER(r.email) LIKE ? OR r.phone LIKE ? OR LOWER(r.description) LIKE ?)");
    values.push(...Array(4).fill(`%${options.search.toLowerCase()}%`));
  }
  if (options.priority) clauses.push("r.priority = 'urgent'");
  if (options.from) { clauses.push("r.created_at >= ?"); values.push(options.from); }
  if (options.to) { clauses.push("r.created_at < DATE_ADD(?, INTERVAL 1 DAY)"); values.push(options.to); }
  const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  const patientScope = isAdmin ? "" : " AND (p.assigned_worker_id = ? OR FIND_IN_SET(?, REPLACE(REPLACE(REPLACE(COALESCE(p.assigned_worker_ids, '[]'), '[', ''), ']', ''), '\"', '')) > 0)";
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT r.*, (SELECT p.id FROM patients p WHERE p.request_id = r.id${patientScope} ORDER BY p.id LIMIT 1) AS patient_id FROM medical_help_requests r${where} ORDER BY r.created_at DESC, r.id DESC LIMIT ? OFFSET ?`,
    [...(isAdmin ? [] : [workerId, workerId]), ...values, options.limit, (options.page - 1) * options.limit],
  );
  const [totals] = await db.query<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM medical_help_requests r${where}`, values);
  const [statuses] = await db.query<RowDataPacket[]>("SELECT COALESCE(status, 'pending') AS status, COUNT(*) AS count FROM medical_help_requests GROUP BY COALESCE(status, 'pending')");
  const counts: QueueCounts = { all: 0, attention: 0, pending: 0, in_progress: 0, resolved: 0, archived: 0 };
  for (const row of statuses) {
    const status = row.status as RequestStatus;
    if (["pending", "in_progress", "resolved", "archived"].includes(status)) counts[status] = Number(row.count);
    counts.all += Number(row.count);
  }
  counts.attention = counts.pending + counts.in_progress;
  const iso = (value: unknown) => value instanceof Date ? value.toISOString() : typeof value === "string" ? value : undefined;
  const requests = rows.map((r): MedicalHelpRequestItem => ({
    id: String(r.id), patient_id: r.patient_id == null ? null : String(r.patient_id), full_name: r.full_name || null, phone: r.phone || "", email: r.email || "", description: r.description || "", status: r.status || "pending", priority: r.priority || "normal", internal_notes: r.internal_notes || null,
    status_updated_by_name: r.status_updated_by_name || null, status_updated_by_email: r.status_updated_by_email || null, status_updated_at: iso(r.status_updated_at), created_at: iso(r.created_at) || "", updated_at: iso(r.updated_at),
  }));
  const total = Number(totals[0]?.total || 0);
  return { requests, counts, page: options.page, hasMore: options.page * options.limit < total, total };
}
