import { getDatabase, type RowDataPacket } from "@/lib/database";

const allowedWorkerRoles = ["administrator", "admin", "doctor", "mediator"];

type AccessRow = RowDataPacket & {
  id: number | string;
};

export type LoginAccessResultReason =
  | "authorized"
  | "unauthorized"
  | "invalid-email"
  | "database-unavailable";

export type LoginAccessResult = {
  allowed: boolean;
  reason: LoginAccessResultReason;
};

export async function checkLoginAccess(
  email: string | null | undefined,
): Promise<LoginAccessResult> {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail || !process.env.DATABASE_URL) {
    return { allowed: false, reason: "invalid-email" };
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

    const allowed = patientRows[0].length > 0 || workerRows[0].length > 0;
    return {
      allowed,
      reason: allowed ? "authorized" : "unauthorized",
    };
  } catch (error) {
    console.error("hasLoginAccess: database check failed", error);
    return { allowed: false, reason: "database-unavailable" };
  }
}

export async function hasLoginAccess(
  email: string | null | undefined,
): Promise<boolean> {
  const result = await checkLoginAccess(email);
  return result.allowed;
}
