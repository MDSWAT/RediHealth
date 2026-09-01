import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PatientsDashboard } from "@/components/panel/PatientsDashboard";
import { loadPatients } from "@/lib/data/patients";
import { countPendingRequests } from "@/lib/data/requests";
import type { PatientItem } from "@/lib/types/patient";
import { getUserWorkerContext } from "@/lib/worker-auth";

export const metadata: Metadata = {
  title: "Patients — RediHealth Panel",
};

export default async function PatientsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const userEmail = session.user.email || "staff account";
  const workerContext = await getUserWorkerContext(userEmail);

  let patients: PatientItem[] = [];
  let pendingRequestsCount = 0;
  let databaseAvailable = Boolean(process.env.DATABASE_URL);

  if (databaseAvailable) {
    try {
      [patients, pendingRequestsCount] = await Promise.all([
        loadPatients({
          scopeToWorkerId: workerContext.isAdmin ? null : workerContext.workerId,
        }),
        countPendingRequests(),
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
      databaseAvailable={databaseAvailable}
      pendingRequestsCount={pendingRequestsCount}
    />
  );
}
