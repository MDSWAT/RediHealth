import { getDatabase, type RowDataPacket } from "@/lib/database";
import { parseJsonColumn } from "@/lib/json";
import type {
  FollowupItem,
  PatientItem,
  PatientPhoto,
  PatientPriority,
  PatientStatus,
  TreatmentPlan,
} from "@/lib/types/patient";

/**
 * Central patient data access. All patient reads share one column list and one
 * row mapper so the panel pages and API routes return an identical `PatientItem`
 * shape instead of each re-implementing the SELECT and JSON parsing.
 */

export const PATIENT_COLUMNS = `p.id, p.request_id, p.assigned_worker_id, w.full_name AS assigned_worker_name,
  p.assigned_worker_ids,
  (
    SELECT GROUP_CONCAT(w2.full_name ORDER BY w2.full_name SEPARATOR '||')
    FROM workers w2
    WHERE FIND_IN_SET(
      CAST(w2.id AS CHAR(32)),
      REPLACE(REPLACE(REPLACE(COALESCE(p.assigned_worker_ids, '[]'), '[', ''), ']', ''), '"', '')
    ) > 0
  ) AS assigned_worker_names_concat,
  p.access_token, p.full_name, p.phone, p.email, p.date_of_birth, p.gender, p.address,
  p.condition_notes, p.medical_history, p.treatment_plan, p.followups, p.photos,
  COALESCE(p.status, 'active') AS status,
  COALESCE(p.priority, 'moderate') AS priority,
  p.created_at, p.updated_at`;

export const PATIENT_FROM = `FROM patients p LEFT JOIN workers w ON w.id = p.assigned_worker_id`;

export interface DBPatientRow extends RowDataPacket {
  id: string | number;
  request_id?: string | number | null;
  assigned_worker_id?: string | number | null;
  assigned_worker_ids?: string | object | null;
  assigned_worker_name?: string | null;
  assigned_worker_names_concat?: string | null;
  access_token?: string | null;
  full_name: string;
  phone: string;
  email: string;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  condition_notes?: string | null;
  medical_history?: string | null;
  treatment_plan?: string | object | null;
  followups?: string | object | null;
  photos?: string | object | null;
  status?: string;
  priority?: string;
  created_at: Date | string;
  updated_at?: Date | string | null;
}

function toIsoString(value: Date | string | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined;
  return value instanceof Date ? value.toISOString() : String(value);
}

export function mapPatientRow(row: DBPatientRow): PatientItem {
  const multiAssignedWorkerIds = parseJsonColumn<Array<string | number>>(row.assigned_worker_ids)
    ?.map((id) => String(id))
    .filter((id) => id.length > 0) || [];
  const assignedWorkerIds =
    multiAssignedWorkerIds.length > 0
      ? [...new Set(multiAssignedWorkerIds)]
      : row.assigned_worker_id != null
      ? [String(row.assigned_worker_id)]
      : [];
  const assignedWorkerNames = row.assigned_worker_names_concat
    ? row.assigned_worker_names_concat
        .split("||")
        .map((name) => name.trim())
        .filter((name) => name.length > 0)
    : row.assigned_worker_name
    ? [row.assigned_worker_name]
    : [];

  return {
    id: String(row.id),
    request_id: row.request_id != null ? String(row.request_id) : null,
    assigned_worker_id:
      row.assigned_worker_id != null ? String(row.assigned_worker_id) : null,
    assigned_worker_ids: assignedWorkerIds,
    assigned_worker_name: row.assigned_worker_name || null,
    assigned_worker_names: [...new Set(assignedWorkerNames)],
    access_token: row.access_token || null,
    full_name: row.full_name,
    phone: row.phone,
    email: row.email,
    date_of_birth: row.date_of_birth || null,
    gender: row.gender || null,
    address: row.address || null,
    condition_notes: row.condition_notes || null,
    medical_history: row.medical_history || null,
    treatment_plan: parseJsonColumn<TreatmentPlan>(row.treatment_plan),
    followups: parseJsonColumn<FollowupItem[]>(row.followups) || [],
    photos: parseJsonColumn<PatientPhoto[]>(row.photos) || [],
    status: (row.status as PatientStatus) || "active",
    priority: (row.priority as PatientPriority) || "moderate",
    created_at: toIsoString(row.created_at) ?? new Date(0).toISOString(),
    updated_at: toIsoString(row.updated_at),
  };
}

export interface LoadPatientsOptions {
  /** When set, only patients assigned to this worker are returned. */
  scopeToWorkerId?: string | null;
  limit?: number;
}

export async function loadPatients(
  options: LoadPatientsOptions = {},
): Promise<PatientItem[]> {
  const { scopeToWorkerId, limit = 100 } = options;
  const db = getDatabase();

  const params: unknown[] = [];
  let sql = `SELECT ${PATIENT_COLUMNS} ${PATIENT_FROM}`;

  if (scopeToWorkerId) {
    sql += ` WHERE (
      p.assigned_worker_id = ?
      OR FIND_IN_SET(
        ?,
        REPLACE(REPLACE(REPLACE(COALESCE(p.assigned_worker_ids, '[]'), '[', ''), ']', ''), '"', '')
      ) > 0
    )`;
    params.push(scopeToWorkerId, scopeToWorkerId);
  }

  sql += ` ORDER BY p.created_at DESC LIMIT ?`;
  params.push(limit);

  const [rows] = await db.query<DBPatientRow[]>(sql, params);
  return rows.map(mapPatientRow);
}
