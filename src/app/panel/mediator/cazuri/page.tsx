import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";
import { AdminShell } from "@/components/panel/AdminShell";
import { CaseTrackingMatrix } from "@/components/mediator/CaseTrackingMatrix";
import { createPageMetadata } from "@/lib/i18n/page-metadata";

export const generateMetadata = createPageMetadata("mediator-cazuri", "Tracked cases - RediHealth panel", "");

export default async function MediatorCasesCohortPage() {
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
      <div
        id="main-content"
        className="min-h-dvh bg-[var(--panel-surface)] px-4 py-5 pb-24 text-[var(--panel-ink)] sm:px-6 sm:py-6"
      >
        <CaseTrackingMatrix />
      </div>
    </AdminShell>
  );
}
