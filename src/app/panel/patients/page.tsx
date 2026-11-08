import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PatientsDashboard } from "@/components/panel/PatientsDashboard";
import { loadPatients } from "@/lib/data/patients";
import { countAttentionRequests } from "@/lib/data/requests";
import { isCountryConfigured } from "@/lib/database";
import type { PatientItem } from "@/lib/types/patient";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";
import { createPageMetadata } from "@/lib/i18n/page-metadata";

export const generateMetadata = createPageMetadata("patients", "Patients - RediHealth Panel", "");

export default async function PatientsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(await withRequestLangPrefix("/sign-in"));
  }

  const userEmail = session.user.email || "staff account";
  const workerContext = await getUserWorkerContext(userEmail);
  if (!workerContext.workerId) redirect(await withRequestLangPrefix("/sign-in"));

  let patients: PatientItem[] = [];
  let pendingRequestsCount = 0;
  let databaseAvailable = isCountryConfigured(workerContext.country);

  if (databaseAvailable) {
    try {
      [patients, pendingRequestsCount] = await Promise.all([
        loadPatients({
          country: workerContext.country,
          scopeToWorkerId: workerContext.isAdmin ? null : workerContext.workerId,
        }),
        countAttentionRequests(workerContext.country),
      ]);
    } catch (error) {
      console.error("Failed to load patients dashboard data", error);
      databaseAvailable = false;
    }
  }

  return (
    <PatientsDashboard
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
