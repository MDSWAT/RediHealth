import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ActivityLogsDashboard } from "@/components/panel/ActivityLogsDashboard";
import { getDatabase, hasDatabaseConnectionConfig, type RowDataPacket } from "@/lib/database";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";
import type { ActivityLogItem } from "@/lib/types/activity-log";
import { getUserWorkerContext } from "@/lib/worker-auth";

export const metadata: Metadata = {
  title: "Activity Logs - RediHealth Panel",
};

type ActivityLogRow = RowDataPacket & {
  id: string | number;
  actor_worker_id: string | number | null;
  actor_name: string | null;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details_json: string | null;
  ip_address: string | null;
  created_at: string | Date;
};

function parseDetails(value: string | null): Record<string, unknown> | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export default async function ActivityLogsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(await withRequestLangPrefix("/sign-in"));
  }

  const userEmail = session.user.email || "staff account";
  const workerContext = await getUserWorkerContext(userEmail);

  if (!workerContext.isSuperAdmin) {
    redirect(await withRequestLangPrefix("/panel"));
  }

  let databaseAvailable = hasDatabaseConnectionConfig();
  let logs: ActivityLogItem[] = [];

  if (databaseAvailable) {
    try {
      const [rows] = await getDatabase().query<ActivityLogRow[]>(
        `SELECT id, actor_worker_id, actor_name, actor_email, actor_role,
                action, entity_type, entity_id, details_json, ip_address, created_at
         FROM activity_logs
         ORDER BY created_at DESC, id DESC
         LIMIT 100`,
      );

      logs = rows.map((row) => ({
        id: String(row.id),
        actor_worker_id: row.actor_worker_id == null ? null : String(row.actor_worker_id),
        actor_name: row.actor_name,
        actor_email: row.actor_email,
        actor_role: row.actor_role,
        action: row.action,
        entity_type: row.entity_type,
        entity_id: row.entity_id,
        details: parseDetails(row.details_json),
        ip_address: row.ip_address,
        created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      }));
    } catch (error) {
      console.error("Failed to load activity logs page", error);
      databaseAvailable = false;
    }
  }

  return (
    <ActivityLogsDashboard
      initialLogs={logs}
      userEmail={userEmail}
      userRole={workerContext.role}
      isAdmin={workerContext.isAdmin}
      isSuperAdmin={workerContext.isSuperAdmin}
      databaseAvailable={databaseAvailable}
    />
  );
}
