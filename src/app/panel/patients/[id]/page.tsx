import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { loadPatients } from "@/lib/data/patients";
import { AdminShell } from "@/components/panel/AdminShell";
import { PatientProfileView } from "@/components/panel/PatientProfileView";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";
import { countPendingRequests } from "@/lib/data/requests";

export const metadata: Metadata = { title: "Patient Profile - RediHealth Panel" };
export const dynamic = "force-dynamic";
export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) redirect(await withRequestLangPrefix("/sign-in"));
  const worker = await getUserWorkerContext(session.user.email);
  if (!worker.workerId) redirect(await withRequestLangPrefix("/sign-in"));
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const [patients, pendingCount] = await Promise.all([
    loadPatients({ id, scopeToWorkerId: worker.isAdmin ? null : worker.workerId, limit: 1 }),
    countPendingRequests().catch(() => 0),
  ]);
  if (!patients[0]) notFound();
  return <AdminShell userEmail={session.user.email} userRole={worker.role} isAdmin={worker.isAdmin} pendingCount={pendingCount}>
    <main id="main-content" className="crm-page"><PatientProfileView initialPatient={patients[0]} isAdmin={worker.isAdmin} /></main>
  </AdminShell>;
}
