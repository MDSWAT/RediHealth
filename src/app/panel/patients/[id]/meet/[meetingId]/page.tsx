import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FollowupMeetingWorkspace } from "@/components/panel/FollowupMeetingWorkspace";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { withRequestLangPrefix } from "@/lib/i18n/server-routing";

export const metadata = {
  title: "Follow-up Meeting — RediHealth Panel",
};

export default async function PatientFollowupMeetingPage({
  params,
}: {
  params: Promise<{ id: string; meetingId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect(await withRequestLangPrefix("/sign-in"));
  }

  const workerContext = await getUserWorkerContext(session.user.email);
  if (!workerContext.workerId) {
    redirect(await withRequestLangPrefix("/panel"));
  }

  const { id, meetingId } = await params;
  return <FollowupMeetingWorkspace meetingId={meetingId} patientId={id} userEmail={session.user.email} userRole={workerContext.role} isAdmin={workerContext.isAdmin} />;
}