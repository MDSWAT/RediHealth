import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { auth } from "@/auth";
import { getDatabase } from "@/lib/database";
import { WorkerDashboard } from "@/components/panel/WorkerDashboard";
import type { MedicalHelpRequestItem } from "@/lib/types/medical-request";
import { getUserWorkerContext } from "@/lib/worker-auth";

export const metadata: Metadata = {
  title: "Worker Panel Dashboard — RediHealth",
};

type DBMedicalHelpRequest = RowDataPacket & {
  id: string;
  full_name: string | null;
  phone: string;
  email: string;
  description: string;
  status?: string;
  priority?: string;
  internal_notes?: string | null;
  created_at: Date | string;
  updated_at?: Date | string;
};

export default async function PanelPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  let requests: DBMedicalHelpRequest[] = [];
  let databaseAvailable = Boolean(process.env.DATABASE_URL);

  if (databaseAvailable) {
    try {
      const db = getDatabase();
      const [rows] = await db.query<DBMedicalHelpRequest[]>(
        `SELECT id, full_name, phone, email, description, 
                COALESCE(status, 'pending') AS status, 
                COALESCE(priority, 'normal') AS priority, 
                internal_notes, created_at, updated_at
         FROM medical_help_requests
         ORDER BY created_at DESC
         LIMIT 100`,
      );
      requests = rows;
    } catch (error) {
      console.error("Failed to load medical help requests", error);
      databaseAvailable = false;
    }
  }

  const formattedRequests: MedicalHelpRequestItem[] = requests.map((r) => ({
    id: String(r.id),
    full_name: r.full_name,
    phone: r.phone,
    email: r.email,
    description: r.description,
    status: (r.status as MedicalHelpRequestItem["status"]) || "pending",
    priority: (r.priority as MedicalHelpRequestItem["priority"]) || "normal",
    internal_notes: r.internal_notes || null,
    created_at:
      r.created_at instanceof Date
        ? r.created_at.toISOString()
        : String(r.created_at),
    updated_at:
      r.updated_at instanceof Date
        ? r.updated_at.toISOString()
        : r.updated_at
        ? String(r.updated_at)
        : undefined,
  }));

  const userEmail = session.user.email || "staff account";
  const workerContext = await getUserWorkerContext(userEmail);

  return (
    <WorkerDashboard
      initialRequests={formattedRequests}
      userEmail={userEmail}
      userRole={workerContext.role}
      isAdmin={workerContext.isAdmin}
      databaseAvailable={databaseAvailable}
    />
  );
}
