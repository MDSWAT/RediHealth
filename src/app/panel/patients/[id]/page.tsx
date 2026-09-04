import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDatabase, hasDatabaseConnectionConfig, type RowDataPacket } from "@/lib/database";
import { AdminShell } from "@/components/panel/AdminShell";
import { PatientProfileView } from "@/components/panel/PatientProfileView";
import { Container } from "@/components/ui/Container";
import type { PatientItem, PatientPriority } from "@/lib/types/patient";
import { getUserWorkerContext } from "@/lib/worker-auth";

export const metadata: Metadata = {
  title: "Patient Profile — RediHealth Panel",
};

type DBPatient = RowDataPacket & {
  id: string;
  request_id?: string | null;
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
  created_at: Date | string;
  updated_at?: Date | string;
};

function parseJson<T>(val: unknown): T | null {
  if (!val) return null;
  if (typeof val === "object") return val as T;
  if (typeof val === "string") {
    try {
      return JSON.parse(val) as T;
    } catch {
      return null;
    }
  }
  return null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const userEmail = session.user.email || "staff account";
  const workerContext = await getUserWorkerContext(userEmail);

  let patientRecord: DBPatient | null = null;
  let pendingRequestsCount = 0;

  if (hasDatabaseConnectionConfig()) {
    try {
      const db = getDatabase();

      try {
        const [counts] = await db.query<RowDataPacket[]>(
          `SELECT COUNT(*) as count FROM medical_help_requests WHERE status = 'pending'`,
        );
        pendingRequestsCount = Number(counts[0]?.count || 0);
      } catch {
      }

      try {
        let sql = `SELECT p.id, p.request_id, p.assigned_worker_id, w.full_name AS assigned_worker_name,
                          p.full_name, p.phone, p.email, p.date_of_birth, p.gender, p.address, 
                          p.condition_notes, p.medical_history, p.treatment_plan, p.followups, p.photos,
                          COALESCE(p.status, 'active') AS status, 
                          COALESCE(p.priority, 'moderate') AS priority, 
                          p.created_at, p.updated_at
                   FROM patients p
                   LEFT JOIN workers w ON w.id = p.assigned_worker_id
                   WHERE p.id = ?`;
        const qParams: unknown[] = [id];

        if (!workerContext.isAdmin && workerContext.workerId) {
          sql += ` AND p.assigned_worker_id = ?`;
          qParams.push(workerContext.workerId);
        }

        const [rows] = await db.query<DBPatient[]>(sql, qParams);
        if (rows.length > 0) {
          patientRecord = rows[0];
        }
      } catch {
      }
    } catch {
    }
  }

  if (!patientRecord) {
    notFound();
  }

  const formattedPatient: PatientItem = {
    id: String(patientRecord.id),
    request_id: patientRecord.request_id ? String(patientRecord.request_id) : null,
    full_name: patientRecord.full_name,
    phone: patientRecord.phone,
    email: patientRecord.email,
    date_of_birth: patientRecord.date_of_birth || null,
    gender: patientRecord.gender || null,
    address: patientRecord.address || null,
    condition_notes: patientRecord.condition_notes || null,
    medical_history: patientRecord.medical_history || null,
    treatment_plan: parseJson(patientRecord.treatment_plan),
    followups: parseJson(patientRecord.followups) || [],
    photos: parseJson(patientRecord.photos) || [],
    status: (patientRecord.status as PatientItem["status"]) || "active",
    priority: (patientRecord.priority as PatientPriority) || "moderate",
    created_at:
      patientRecord.created_at instanceof Date
        ? patientRecord.created_at.toISOString()
        : String(patientRecord.created_at),
    updated_at:
      patientRecord.updated_at instanceof Date
        ? patientRecord.updated_at.toISOString()
        : patientRecord.updated_at
        ? String(patientRecord.updated_at)
        : undefined,
  };

  return (
    <AdminShell
      userEmail={userEmail}
      userRole={workerContext.role}
      isAdmin={workerContext.isAdmin}
      pendingCount={pendingRequestsCount}
    >
      <main id="main-content" className="min-h-screen py-8 sm:py-10">
        <Container>
          <PatientProfileView initialPatient={formattedPatient} />
        </Container>
      </main>
    </AdminShell>
  );
}
