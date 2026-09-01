import type { RowDataPacket } from "mysql2";
import { getDatabase } from "@/lib/database";

export type UserWorkerContext = {
  workerId: string | null;
  workerName: string | null;
  role: string;
  isAdmin: boolean;
};

type DBWorkerAuthRow = RowDataPacket & {
  id: number | string;
  full_name: string;
  role: string;
  status: string;
};

export async function getUserWorkerContext(
  userEmail: string | null | undefined,
): Promise<UserWorkerContext> {
  if (!userEmail) {
    return {
      workerId: null,
      workerName: null,
      role: "Unauthorized",
      isAdmin: false,
    };
  }

  const normalizedEmail = userEmail.trim().toLowerCase();

  try {
    const db = getDatabase();
    const [rows] = await db.query<DBWorkerAuthRow[]>(
      `SELECT id, full_name, COALESCE(role, 'Healthcare Worker') AS role, COALESCE(status, 'active') AS status
       FROM workers
       WHERE LOWER(email) = ? AND status = 'active'
       LIMIT 1`,
      [normalizedEmail],
    );

    if (rows.length === 0) {
      return {
        workerId: null,
        workerName: null,
        role: "Unauthorized",
        isAdmin: false,
      };
    }

    const worker = rows[0];
    const roleLower = worker.role.trim().toLowerCase();
    const isAdmin = roleLower === "administrator" || roleLower === "admin";

    return {
      workerId: String(worker.id),
      workerName: worker.full_name,
      role: worker.role,
      isAdmin,
    };
  } catch {
    return {
      workerId: null,
      workerName: null,
      role: "Unauthorized",
      isAdmin: false,
    };
  }
}
