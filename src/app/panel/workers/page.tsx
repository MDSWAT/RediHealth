import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { WorkersDashboard } from "@/components/panel/WorkersDashboard";
import { loadPatients } from "@/lib/data/patients";
import { loadWorkers } from "@/lib/data/workers";
import { countPendingRequests } from "@/lib/data/requests";
import { isCountryConfigured } from "@/lib/database";
import type { PatientItem } from "@/lib/types/patient";
import type { WorkerItem } from "@/lib/types/worker";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";
import { createPageMetadata } from "@/lib/i18n/page-metadata";

export const generateMetadata = createPageMetadata("workers", "Workers - RediHealth Panel", "");

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
  let databaseAvailable = isCountryConfigured(workerContext.country);

  if (databaseAvailable) {
    try {
      [workers, patients, pendingRequestsCount] = await Promise.all([
        loadWorkers(workerContext.country),
        loadPatients({ country: workerContext.country }),
        countPendingRequests(workerContext.country),
      ]);
    } catch (error) {
      console.error("Failed to load workers dashboard data", error);
      databaseAvailable = false;
    }
  }

  return (
    <WorkersDashboard
      initialWorkers={workers}
      initialPatients={patients}
      userEmail={userEmail}
      userRole={workerContext.role}
      isAdmin={workerContext.isAdmin}
      isRomania={workerContext.country === "RO"}
      databaseAvailable={databaseAvailable}
      pendingRequestsCount={pendingRequestsCount}
    />
  );
}
