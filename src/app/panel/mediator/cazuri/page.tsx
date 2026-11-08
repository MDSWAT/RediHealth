import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";
import { AdminShell } from "@/components/panel/AdminShell";
import { Container } from "@/components/ui/Container";
import { CaseTrackingMatrix } from "@/components/mediator/CaseTrackingMatrix";
import { createPageMetadata } from "@/lib/i18n/page-metadata";

export const generateMetadata = createPageMetadata("mediator-cazuri", "Urmărire cazuri comunitare - RediHealth Panel", "");

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
      <main id="main-content" className="py-6 sm:py-8">
        <Container className="max-w-6xl">
          <CaseTrackingMatrix />
        </Container>
      </main>
    </AdminShell>
  );
}
