import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserWorkerContext } from "@/lib/worker-auth";
import { createFollowup, FollowupError } from "@/lib/data/followups";
import { sendMeetingInvitationEmail } from "@/lib/email";
import { logActivity } from "@/lib/activity-log";
import { getClientIp } from "@/lib/rate-limit";
import { getRequestLang } from "@/lib/i18n/server-routing";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const worker = await getUserWorkerContext(session.user.email);
  if (!worker.workerId) return NextResponse.json({ error: "Staff access is required." }, { status: 403 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid patient." }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid appointment." }, { status: 400 }); }
  try {
    const result = await createFollowup(id, String(worker.workerId), worker.isAdmin, body);
    let emailSent: boolean | undefined;
    if (result.created && result.followup.meeting_url) {
      try {
        emailSent = Boolean(result.email) && await sendMeetingInvitationEmail({ name: result.name, email: result.email, title: result.followup.title, meetingUrl: result.followup.meeting_url, date: result.followup.date, time: result.followup.time, timezone: result.followup.timezone, lang: await getRequestLang(request) });
      } catch { emailSent = false; }
    }
    if (result.created) {
      await logActivity({ actorWorkerId: worker.workerId, actorName: worker.workerName, actorRole: worker.role, action: "patient.followup_created", entityType: "patient", entityId: id, details: { followup_id: result.followup.id, meeting_id: result.followup.meeting_id }, ipAddress: getClientIp(request) }).catch((error) => console.error("Failed to log appointment", error));
    }
    return NextResponse.json({ followup: result.followup, email_sent: emailSent }, { status: result.created ? 201 : 200 });
  } catch (error) {
    if (error instanceof FollowupError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Failed to schedule follow-up", error);
    return NextResponse.json({ error: "Could not save appointment. Please try again." }, { status: 503 });
  }
}
