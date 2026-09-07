import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDatabase, type RowDataPacket } from "@/lib/database";
import { sendMeetingInvitationEmail } from "@/lib/email";
import { getUserWorkerContext } from "@/lib/worker-auth";

type InvitationRow = RowDataPacket & {
  id: number;
  title: string;
  meeting_url: string;
  full_name: string;
  email: string;
};

function normalizeMeetingUrl(rawUrl: string, meetingId: number) {
  const fallback = `https://meet.jit.si/redihealth-${meetingId}`;
  const value = rawUrl.trim();
  if (!value) return fallback;

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    if (host.includes("8x8.vc") || value.includes("vpaas-magic-cookie")) {
      return fallback;
    }
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return fallback;
  }
}

export async function POST(
  _request: Request,
  { params }: RouteContext<"/api/meetings/[id]/invite">,
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const worker = await getUserWorkerContext(session.user.email);
  if (!worker.workerId) {
    return NextResponse.json({ error: "Staff access is required." }, { status: 403 });
  }

  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid meeting." }, { status: 400 });
  }

  try {
    const query = worker.isAdmin
      ? "SELECT m.id, m.title, m.meeting_url, p.full_name, p.email FROM meetings m INNER JOIN patients p ON p.id = m.patient_id WHERE m.id = ? LIMIT 1"
      : "SELECT m.id, m.title, m.meeting_url, p.full_name, p.email FROM meetings m INNER JOIN patients p ON p.id = m.patient_id WHERE m.id = ? AND m.organizer_worker_id = ? LIMIT 1";
    const params = worker.isAdmin ? [id] : [id, worker.workerId];
    const [rows] = await getDatabase().query<InvitationRow[]>(query, params);
    const meeting = rows[0];
    if (!meeting) {
      return NextResponse.json({ error: "A linked patient meeting was not found." }, { status: 404 });
    }

    await sendMeetingInvitationEmail({
      name: meeting.full_name,
      email: meeting.email,
      title: meeting.title,
      meetingUrl: normalizeMeetingUrl(meeting.meeting_url, meeting.id),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send meeting invitation", error);
    return NextResponse.json({ error: "Could not send the meeting invitation. Check email configuration and try again." }, { status: 503 });
  }
}