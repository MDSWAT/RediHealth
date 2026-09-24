import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity-log";
import { getDatabase, type RowDataPacket } from "@/lib/database";
import { isEmailConfigured, renderBrandEmail, sendEmail } from "@/lib/email";
import { getClientIp } from "@/lib/rate-limit";
import { getUserWorkerContext } from "@/lib/worker-auth";

type ReplyTemplateId = "acknowledgment" | "consultation" | "referral";

type RequesterRow = RowDataPacket & {
  full_name: string | null;
  phone: string;
  email: string | null;
  description: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getTemplate(templateId: ReplyTemplateId, requester: RequesterRow) {
  const name = requester.full_name?.trim() || "Valued Customer";
  const descriptionPreview = requester.description.slice(0, 100);
  const safePhone = escapeHtml(requester.phone);
  const safeDescriptionPreview = escapeHtml(descriptionPreview);

  switch (templateId) {
    case "acknowledgment":
      return {
        subject: "RediHealth: Medical Request Received",
        text: `Hello ${name},\n\nWe have received your medical help request regarding: "${descriptionPreview}...". A healthcare support worker is reviewing your request and will call you at ${requester.phone} shortly.\n\nBest regards,\nRediHealth Staff`,
        html: renderBrandEmail({
          previewText: "Your RediHealth request was received.",
          badgeText: "Request Update",
          heading: "Medical request received",
          recipientName: name,
          intro:
            "We received your medical help request and a healthcare support worker is now reviewing it.",
          contentHtml: `
                  <tr>
                    <td style="padding: 0 0 20px 0;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
                        <tr>
                          <td style="padding: 14px 18px; font-size: 14px; line-height: 22px; color: #475569;">
                            <p style="margin: 0 0 8px 0;"><strong style="color: #0f172a;">Request topic:</strong> ${safeDescriptionPreview}...</p>
                            <p style="margin: 0;"><strong style="color: #0f172a;">Contact phone:</strong> ${safePhone}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>`,
          closingText: "A support worker will call you shortly.",
          footerReason: "You received this email in response to your medical help request on RediHealth.",
        }),
      };
    case "consultation":
      return {
        subject: "RediHealth: Support Consultation Options",
        text: `Hello ${name},\n\nThank you for reaching out to RediHealth. Based on your enquiry, we would like to schedule a quick call or direct you to a nearby health institute. Please let us know your preferred time to speak.\n\nContact phone: ${requester.phone}\n\nBest regards,\nRediHealth Staff`,
        html: renderBrandEmail({
          previewText: "Consultation options from RediHealth.",
          badgeText: "Consultation",
          heading: "Support consultation options",
          recipientName: name,
          intro:
            "Based on your enquiry, we can schedule a quick call or direct you to a nearby health institute.",
          contentHtml: `
                  <tr>
                    <td style="padding: 0 0 20px 0;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
                        <tr>
                          <td style="padding: 14px 18px; font-size: 14px; line-height: 22px; color: #475569;">
                            <p style="margin: 0 0 8px 0;">Please reply with your preferred time for a call.</p>
                            <p style="margin: 0;"><strong style="color: #0f172a;">Contact phone:</strong> ${safePhone}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>`,
          closingText: "We are here to help you with next medical steps.",
          footerReason: "You received this email in response to your medical help request on RediHealth.",
        }),
      };
    case "referral":
      return {
        subject: "RediHealth: Help & Next Steps",
        text: `Hello ${name},\n\nRegarding your enquiry, we recommend contacting your primary healthcare provider or local clinic. If you need assistance finding medical institutes in your area, please visit our Find Help map at https://redihealth.org/find-help.\n\nBest regards,\nRediHealth Staff`,
        html: renderBrandEmail({
          previewText: "Recommended next steps from RediHealth.",
          badgeText: "Medical Guidance",
          heading: "Help and next steps",
          recipientName: name,
          intro:
            "Based on your enquiry, we recommend contacting your primary healthcare provider or a nearby clinic.",
          cta: {
            label: "Open Find Help Map",
            url: "https://redihealth.org/find-help",
          },
          closingText: "If needed, our team can still guide you to suitable local services.",
          footerReason: "You received this email in response to your medical help request on RediHealth.",
        }),
      };
  }
}

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
    const [rows] = await getDatabase().query<RequesterRow[]>(
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

    const template = getTemplate(templateId as ReplyTemplateId, requester);
    await sendEmail({ to: requester.email.trim(), ...template });

    await logActivity({
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
      { error: "We could not send the email. Please try again." },
      { status: 502 },
    );
  }
}