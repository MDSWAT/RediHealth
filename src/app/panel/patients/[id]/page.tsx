import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { loadPatients } from "@/lib/data/patients";
import { AdminShell } from "@/components/panel/AdminShell";
import { PatientProfileView } from "@/components/panel/PatientProfileView";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";
import { countAttentionRequests } from "@/lib/data/requests";
import { createPageMetadata } from "@/lib/i18n/page-metadata";

export const generateMetadata = createPageMetadata("patient-profile", "Patient Profile - RediHealth Panel", "");
export const dynamic = "force-dynamic";
export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) redirect(await withRequestLangPrefix("/sign-in"));
  const worker = await getUserWorkerContext(session.user.email);
  if (!worker.workerId) redirect(await withRequestLangPrefix("/sign-in"));
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const [patients, pendingCount] = await Promise.all([
    loadPatients({ country: worker.country, id, scopeToWorkerId: worker.isAdmin ? null : worker.workerId, limit: 1 }),
    countAttentionRequests(worker.country).catch(() => 0),
  ]);
  if (!patients[0]) notFound();
  return <AdminShell userEmail={session.user.email} userRole={worker.role} isAdmin={worker.isAdmin} pendingCount={pendingCount}>
    <main id="main-content" className="crm-page"><PatientProfileView initialPatient={patients[0]} isAdmin={worker.isAdmin} isRomania={worker.country === "RO"} /></main>
  </AdminShell>;
}
