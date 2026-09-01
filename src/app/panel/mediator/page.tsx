import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MediatorCaseForm } from "@/components/panel/MediatorCaseForm";
import { getUserWorkerContext } from "@/lib/worker-auth";

export const metadata = {
  title: "New Mediator Case — RediHealth Panel",
};

export default async function MediatorCasesPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/sign-in");
  }

  const workerContext = await getUserWorkerContext(session.user.email);
  const role = workerContext.role.trim().toLowerCase();
  if (role !== "mediator" && !workerContext.isAdmin) {
    redirect("/panel");
  }

  return (
    <MediatorCaseForm
      userEmail={session.user.email}
      userRole={workerContext.role}
      isAdmin={workerContext.isAdmin}
    />
  );
}