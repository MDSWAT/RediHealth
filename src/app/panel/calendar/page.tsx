import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CalendarDashboard } from "@/components/panel/CalendarDashboard";
import { loadPatients } from "@/lib/data/patients";
import { countPendingRequests } from "@/lib/data/requests";
import type { PatientItem } from "@/lib/types/patient";
import { getUserWorkerContext } from "@/lib/worker-auth";

export const metadata: Metadata = {
  title: "Calendar — RediHealth Panel",
};

export default async function CalendarPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const userEmail = session.user.email || "staff account";
  const workerContext = await getUserWorkerContext(userEmail);

  if (workerContext.role.trim().toLowerCase() === "mediator" && !workerContext.isAdmin) {
    redirect("/panel");
  }

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
      console.error("Failed to load calendar dashboard data", error);
      databaseAvailable = false;
    }
  }

  return (
    <CalendarDashboard
      initialPatients={patients}
      userEmail={userEmail}
      userRole={workerContext.role}
      isAdmin={workerContext.isAdmin}
      databaseAvailable={databaseAvailable}
      pendingRequestsCount={pendingRequestsCount}
    />
  );
}
