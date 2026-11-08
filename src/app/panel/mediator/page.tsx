import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";
import { createPageMetadata } from "@/lib/i18n/page-metadata";
import { AdminShell } from "@/components/panel/AdminShell";
import { MobileFieldMediatorDashboard } from "@/components/mediator/MobileFieldMediatorDashboard";

export const generateMetadata = createPageMetadata("panel", "Staff panel - RediHealth", "");

export default async function MediatorFieldDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(await withRequestLangPrefix("/sign-in"));
  }

  const userEmail = session.user.email || "staff account";
  const workerContext = await getUserWorkerContext(userEmail);

  if (!workerContext.workerId) {
    redirect(await withRequestLangPrefix("/sign-in"));
  }

  return (
    <AdminShell
      userEmail={userEmail}
      userRole={workerContext.role}
      isAdmin={workerContext.isAdmin}
    >
      {/* Real worker name only; no invented community or county. */}
      <MobileFieldMediatorDashboard mediatorName={workerContext.workerName || session.user.name || userEmail} />
    </AdminShell>
  );
}
