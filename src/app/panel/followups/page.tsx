import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FollowupsDashboard } from "@/components/panel/FollowupsDashboard";
import { loadPatients } from "@/lib/data/patients";
import { countPendingRequests } from "@/lib/data/requests";
import { hasDatabaseConnectionConfig } from "@/lib/database";
import type { PatientItem } from "@/lib/types/patient";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";

export const metadata: Metadata = {
  title: "Follow-ups — RediHealth Panel",
};

export default async function FollowupsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(await withRequestLangPrefix("/sign-in"));
  }

  const userEmail = session.user.email || "staff account";
  const workerContext = await getUserWorkerContext(userEmail);

  if (workerContext.role.trim().toLowerCase() === "mediator" && !workerContext.isAdmin) {
    redirect(await withRequestLangPrefix("/panel"));
  }

  let patients: PatientItem[] = [];
  let pendingRequestsCount = 0;
  let databaseAvailable = hasDatabaseConnectionConfig();

  if (databaseAvailable) {
    try {
      [patients, pendingRequestsCount] = await Promise.all([
        loadPatients({
          scopeToWorkerId: workerContext.isAdmin ? null : workerContext.workerId,
        }),
        countPendingRequests(),
      ]);
    } catch (error) {
      console.error("Failed to load follow-ups dashboard data", error);
      databaseAvailable = false;
    }
  }

  return (
    <FollowupsDashboard
      initialPatients={patients}
      userEmail={userEmail}
      userRole={workerContext.role}
      isAdmin={workerContext.isAdmin}
      databaseAvailable={databaseAvailable}
      pendingRequestsCount={pendingRequestsCount}
    />
  );
}
