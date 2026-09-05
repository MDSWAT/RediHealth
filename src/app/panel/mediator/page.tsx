import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MediatorCaseForm } from "@/components/panel/MediatorCaseForm";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";

export const metadata = {
  title: "New Mediator Case — RediHealth Panel",
};

export default async function MediatorCasesPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect(await withRequestLangPrefix("/sign-in"));
  }

  const workerContext = await getUserWorkerContext(session.user.email);
  const role = workerContext.role.trim().toLowerCase();
  if (role !== "mediator" && !workerContext.isAdmin) {
    redirect(await withRequestLangPrefix("/panel"));
  }

  return (
    <MediatorCaseForm
      userEmail={session.user.email}
      userRole={workerContext.role}
      isAdmin={workerContext.isAdmin}
    />
  );
}