import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MedicalInstitutesDashboard } from "@/components/panel/MedicalInstitutesDashboard";
import { listInstitutesForAdmin } from "@/lib/data/medical-institutes";
import { hasDatabaseConnectionConfig } from "@/lib/database";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";
import { getUserWorkerContext } from "@/lib/worker-auth";

export const metadata: Metadata = {
  title: "Medical institutes - RediHealth Panel",
};

export default async function MedicalInstitutesPage() {
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
  let initialData: Awaited<ReturnType<typeof listInstitutesForAdmin>> | null = null;

  if (databaseAvailable) {
    try {
      initialData = await listInstitutesForAdmin({ page: 1, pageSize: 50 });
    } catch (error) {
      console.error("Failed to load medical institutes page", error);
      databaseAvailable = false;
    }
  }

  return (
    <MedicalInstitutesDashboard
      initialData={initialData}
      userEmail={userEmail}
      userRole={workerContext.role}
      databaseAvailable={databaseAvailable}
    />
  );
}
