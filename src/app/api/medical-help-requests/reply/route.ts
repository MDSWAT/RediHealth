import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity-log";
import { getCountryDatabase, type RowDataPacket } from "@/lib/database";
import { isEmailConfigured, renderHelpRequestReplyEmail, sendEmail } from "@/lib/email";
import { getClientIp } from "@/lib/rate-limit";
import { getRequestLang } from "@/lib/i18n/server-routing";
import type { ReplyTemplateId } from "@/lib/i18n/email-translations";
import { getUserWorkerContext } from "@/lib/worker-auth";

type RequesterRow = RowDataPacket & {
  full_name: string | null;
  phone: string;
  email: string | null;
  description: string;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const workerContext = await getUserWorkerContext(session.user.email);
  if (!workerContext.workerId) {
    return NextResponse.json({ error: "Staff access is required." }, { status: 403 });
  }

  let body: { requestId?: unknown; templateId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request data." }, { status: 400 });
  }

  const requestId = typeof body.requestId === "string" ? body.requestId.trim() : "";
  const templateId = body.templateId;
  if (!requestId || !["acknowledgment", "consultation", "referral"].includes(String(templateId))) {
    return NextResponse.json({ error: "Invalid reply template." }, { status: 400 });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({ error: "Email sending is not configured." }, { status: 503 });
  }

  try {
    const [rows] = await getCountryDatabase(workerContext.country).query<RequesterRow[]>(
      "SELECT full_name, phone, email, description FROM medical_help_requests WHERE id = ? LIMIT 1",
      [requestId],
    );
    const requester = rows[0];
    if (!requester) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }
    if (!requester.email?.trim()) {
      return NextResponse.json({ error: "This request has no email address." }, { status: 400 });
    }

    const template = renderHelpRequestReplyEmail({ templateId: templateId as ReplyTemplateId, name: requester.full_name ?? "", phone: requester.phone, description: requester.description, lang: await getRequestLang(request) });
    await sendEmail({ to: requester.email.trim(), ...template });

    await logActivity({
      country: workerContext.country,
      actorWorkerId: workerContext.workerId,
      actorName: workerContext.workerName,
      actorEmail: session.user.email || null,
      actorRole: workerContext.role,
      action: "request.reply_template_sent",
      entityType: "medical_help_request",
      entityId: requestId,
      details: {
        template_id: templateId,
        recipient_email: requester.email.trim(),
      },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send request reply", error);
    return NextResponse.json(
      { error: "Could not send the email. Try again." },
      { status: 502 },
    );
  }
}