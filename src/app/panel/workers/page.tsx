import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { WorkersDashboard } from "@/components/panel/WorkersDashboard";
import { loadPatients } from "@/lib/data/patients";
import { loadWorkers } from "@/lib/data/workers";
import { countPendingRequests } from "@/lib/data/requests";
import { hasDatabaseConnectionConfig } from "@/lib/database";
import type { PatientItem } from "@/lib/types/patient";
import type { WorkerItem } from "@/lib/types/worker";
import { getFollowupState } from "@/lib/patient-helpers";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";

export const metadata: Metadata = {
  title: "Workers — RediHealth Panel",
};

export default async function WorkersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(await withRequestLangPrefix("/sign-in"));
  }

  const userEmail = session.user.email || "staff account";
  const workerContext = await getUserWorkerContext(userEmail);

  if (!workerContext.isAdmin) {
    redirect(await withRequestLangPrefix("/panel"));
  }

  let workers: WorkerItem[] = [];
  let patients: PatientItem[] = [];
  let pendingRequestsCount = 0;
  let databaseAvailable = hasDatabaseConnectionConfig();

  if (databaseAvailable) {
    try {
      [workers, patients, pendingRequestsCount] = await Promise.all([
        loadWorkers(),
        loadPatients(),
        countPendingRequests(),
      ]);
    } catch (error) {
      console.error("Failed to load workers dashboard data", error);
      databaseAvailable = false;
    }
  }

  const overdueFollowupsCount = patients.reduce(
    (total, patient) =>
      getFollowupState(patient.followups).state === "overdue" ? total + 1 : total,
    0,
  );

  return (
    <WorkersDashboard
      initialWorkers={workers}
      initialPatients={patients}
      userEmail={userEmail}
      userRole={workerContext.role}
      isAdmin={workerContext.isAdmin}
      databaseAvailable={databaseAvailable}
      pendingRequestsCount={pendingRequestsCount}
      overdueFollowupsCount={overdueFollowupsCount}
    />
  );
}
