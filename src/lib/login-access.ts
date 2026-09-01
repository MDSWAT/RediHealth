import type { RowDataPacket } from "mysql2";
import { getDatabase } from "@/lib/database";

const allowedWorkerRoles = ["administrator", "admin", "doctor", "mediator"];

type AccessRow = RowDataPacket & {
  id: number | string;
};

export async function hasLoginAccess(
  email: string | null | undefined,
): Promise<boolean> {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail || !process.env.DATABASE_URL) {
    return false;
  }

  try {
    const db = getDatabase();
    const [patientRows, workerRows] = await Promise.all([
      db.query<AccessRow[]>(
        "SELECT id FROM patients WHERE LOWER(email) = ? LIMIT 1",
        [normalizedEmail],
      ),
      db.query<AccessRow[]>(
        `SELECT id
         FROM workers
         WHERE LOWER(email) = ?
           AND status = 'active'
           AND LOWER(TRIM(role)) IN (?, ?, ?, ?)
         LIMIT 1`,
        [normalizedEmail, ...allowedWorkerRoles],
      ),
    ]);

    return patientRows[0].length > 0 || workerRows[0].length > 0;
  } catch {
    return false;
  }
}
