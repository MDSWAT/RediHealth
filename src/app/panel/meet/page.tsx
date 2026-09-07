import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MeetDashboard } from "@/components/panel/MeetDashboard";
import { loadPatients } from "@/lib/data/patients";
import { countPendingRequests } from "@/lib/data/requests";
import { getDatabase, hasDatabaseConnectionConfig, type RowDataPacket } from "@/lib/database";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";

export const metadata: Metadata = {
  title: "Meet — RediHealth Panel",
};

type MeetingRow = RowDataPacket & {
  id: number | string;
  title: string;
  meeting_url: string;
  transcript: string | null;
  notes: string | null;
  patient_id: number | string | null;
  patient_name: string | null;
  created_at: Date | string;
};

export default async function MeetPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(await withRequestLangPrefix("/sign-in"));
  }

  const userEmail = session.user.email || "staff account";
  const workerContext = await getUserWorkerContext(userEmail);

  if (!workerContext.workerId) {
    redirect(await withRequestLangPrefix("/panel"));
  }

  let databaseAvailable = hasDatabaseConnectionConfig();
  let pendingRequestsCount = 0;
  let assignedPatients: { id: string; full_name: string; priority?: string | null }[] = [];
  let meetings: {
    id: string;
    title: string;
    meeting_url: string;
    transcript: string | null;
    notes: string | null;
    patient_id: string | null;
    patient_name: string | null;
    created_at: string;
  }[] = [];

  if (databaseAvailable) {
    try {
      const [patients, pendingCount] = await Promise.all([
        loadPatients({ scopeToWorkerId: workerContext.isAdmin ? null : workerContext.workerId, limit: 200 }),
        countPendingRequests(),
      ]);

      assignedPatients = patients
        .filter((patient) => (workerContext.isAdmin ? Boolean(patient.assigned_worker_id) : true))
        .map((patient) => ({
          id: patient.id,
          full_name: patient.full_name,
          priority: patient.priority,
        }));
      pendingRequestsCount = pendingCount;

      const meetingsQuery = workerContext.isAdmin
        ? `SELECT m.id, m.title, m.meeting_url, m.transcript, m.notes, m.patient_id, p.full_name AS patient_name, m.created_at
           FROM meetings m
           LEFT JOIN patients p ON p.id = m.patient_id
           ORDER BY m.created_at DESC
           LIMIT 120`
        : `SELECT m.id, m.title, m.meeting_url, m.transcript, m.notes, m.patient_id, p.full_name AS patient_name, m.created_at
           FROM meetings m
           LEFT JOIN patients p ON p.id = m.patient_id
           WHERE m.organizer_worker_id = ?
           ORDER BY m.created_at DESC
           LIMIT 120`;
      const meetingsParams = workerContext.isAdmin ? [] : [workerContext.workerId];
      const [meetingRows] = await getDatabase().query<MeetingRow[]>(meetingsQuery, meetingsParams);
      meetings = meetingRows.map((row) => ({
        id: String(row.id),
        title: row.title,
        meeting_url: row.meeting_url,
        transcript: row.transcript,
        notes: row.notes,
        patient_id: row.patient_id == null ? null : String(row.patient_id),
        patient_name: row.patient_name,
        created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      }));
    } catch (error) {
      console.error("Failed to load meet dashboard data", error);
      databaseAvailable = false;
    }
  }

  return (
    <MeetDashboard
      userEmail={userEmail}
      userRole={workerContext.role}
      isAdmin={workerContext.isAdmin}
      pendingRequestsCount={pendingRequestsCount}
      databaseAvailable={databaseAvailable}
      assignedPatients={assignedPatients}
      initialMeetings={meetings}
    />
  );
}
