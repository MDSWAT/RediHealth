import { getCountryDatabase, isCountryConfigured, type RowDataPacket } from "@/lib/database";
import type { UserWorkerContext } from "@/lib/worker-auth";

/**
 * Object-level access checks for staff routes. A staff member may touch a patient only when they
 * are assigned to them, and a meeting only when they organise it or are assigned to its patient.
 * Admins (and super admins) may touch any record in their country.
 */
type StaffWorker = Pick<UserWorkerContext, "country" | "isAdmin"> & { workerId: string };

/** SQL condition: the patient row (aliased `alias`) is assigned to the worker. Takes the worker id twice. */
export function assignedToWorkerSql(alias = "") {
  const p = alias ? `${alias}.` : "";
  return `(${p}assigned_worker_id = ? OR jsonb_has_id(${p}assigned_worker_ids, ?))`;
}

export async function canAccessPatient(worker: StaffWorker, patientId: number): Promise<boolean> {
  if (!isCountryConfigured(worker.country)) return false;
  const [rows] = await getCountryDatabase(worker.country).query<RowDataPacket[]>(
    worker.isAdmin
      ? "SELECT id FROM patients WHERE id = ? LIMIT 1"
      : `SELECT id FROM patients WHERE id = ? AND ${assignedToWorkerSql()} LIMIT 1`,
    worker.isAdmin ? [patientId] : [patientId, worker.workerId, worker.workerId],
  );
  return rows.length > 0;
}

export async function canAccessMeeting(worker: StaffWorker, meetingId: number): Promise<boolean> {
  if (!isCountryConfigured(worker.country)) return false;
  const [rows] = await getCountryDatabase(worker.country).query<RowDataPacket[]>(
    worker.isAdmin
      ? "SELECT id FROM meetings WHERE id = ? LIMIT 1"
      : `SELECT m.id FROM meetings m LEFT JOIN patients p ON p.id = m.patient_id
         WHERE m.id = ? AND (m.organizer_worker_id = ? OR (p.id IS NOT NULL AND ${assignedToWorkerSql("p")})) LIMIT 1`,
    worker.isAdmin ? [meetingId] : [meetingId, worker.workerId, worker.workerId, worker.workerId],
  );
  return rows.length > 0;
}

/** Patient id of a meeting, so a reading tied to a meeting is also tied to the right patient. */
export async function meetingPatientId(worker: Pick<StaffWorker, "country">, meetingId: number): Promise<number | null> {
  if (!isCountryConfigured(worker.country)) return null;
  const [rows] = await getCountryDatabase(worker.country).query<RowDataPacket[]>(
    "SELECT patient_id FROM meetings WHERE id = ? LIMIT 1",
    [meetingId],
  );
  const value = rows[0]?.patient_id;
  return value == null ? null : Number(value);
}
