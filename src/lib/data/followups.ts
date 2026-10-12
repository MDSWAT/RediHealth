import { randomUUID } from "crypto";
import { getDatabase, type ResultSetHeader, type RowDataPacket } from "@/lib/database";
import { parseJsonColumn } from "@/lib/json";
import { validateFollowupInput } from "@/lib/validation";
import type { FollowupItem } from "@/lib/types/patient";

export class FollowupError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function createFollowup(patientId: string, workerId: string, isAdmin: boolean, input: unknown) {
  const parsed = validateFollowupInput(input);
  if (!parsed.ok) throw new FollowupError(parsed.error, 400);
  const body = input as Record<string, unknown>;
  const id = typeof body.id === "string" && /^[a-zA-Z0-9-]{1,64}$/.test(body.id) ? body.id : randomUUID();
  const item: FollowupItem = { ...parsed.value, id, status: "scheduled" };
  const connection = await getDatabase().getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT id, full_name, email, followups FROM patients WHERE id = ?${isAdmin ? "" : " AND (assigned_worker_id = ? OR FIND_IN_SET(?, REPLACE(REPLACE(REPLACE(COALESCE(assigned_worker_ids, '[]'), '[', ''), ']', ''), '\"', '')) > 0)"} FOR UPDATE`,
      isAdmin ? [patientId] : [patientId, workerId, workerId],
    );
    if (!rows[0]) throw new FollowupError("Patient not found or not assigned to you.", 404);
    const existing = parseJsonColumn<FollowupItem[]>(rows[0].followups) || [];
    const duplicate = existing.find((f) => f.id === id);
    if (duplicate) {
      await connection.commit();
      return { followup: duplicate, created: false, name: String(rows[0].full_name || ""), email: String(rows[0].email || "") };
    }
    if (body.video === true) {
      const configured = (process.env.JITSI_DOMAIN || "meet.jit.si").replace(/^https?:\/\//i, "").split("/")[0];
      const domain = /^[a-z0-9.-]+$/i.test(configured) && !configured.includes("8x8.vc") ? configured : "meet.jit.si";
      item.meeting_url = `https://${domain}/redihealth-${randomUUID()}`;
      const [result] = await connection.query<ResultSetHeader>(
        "INSERT INTO meetings (organizer_worker_id, patient_id, followup_id, title, meeting_url) VALUES (?, ?, ?, ?, ?)",
        [workerId, patientId, id, item.title, item.meeting_url],
      );
      item.meeting_id = String(result.insertId);
    }
    await connection.query("UPDATE patients SET followups = ? WHERE id = ?", [JSON.stringify([item, ...existing]), patientId]);
    await connection.commit();
    return { followup: item, created: true, name: String(rows[0].full_name || ""), email: String(rows[0].email || "") };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
