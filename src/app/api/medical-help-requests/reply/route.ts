import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { auth } from "@/auth";
import { getDatabase } from "@/lib/database";
import { isEmailConfigured, sendEmail } from "@/lib/email";

type ReplyTemplateId = "acknowledgment" | "consultation" | "referral";

type RequesterRow = RowDataPacket & {
  full_name: string | null;
  phone: string;
  email: string;
  description: string;
};

function getTemplate(templateId: ReplyTemplateId, requester: RequesterRow) {
  const name = requester.full_name?.trim() || "Valued Customer";

  switch (templateId) {
    case "acknowledgment":
      return {
        subject: "RediHealth: Medical Request Received",
        text: `Hello ${name},\n\nWe have received your medical help request regarding: "${requester.description.slice(0, 100)}...". A healthcare support worker is reviewing your request and will call you at ${requester.phone} shortly.\n\nBest regards,\nRediHealth Staff`,
      };
    case "consultation":
      return {
        subject: "RediHealth: Support Consultation Options",
        text: `Hello ${name},\n\nThank you for reaching out to RediHealth. Based on your enquiry, we would like to schedule a quick call or direct you to a nearby health institute. Please let us know your preferred time to speak.\n\nContact phone: ${requester.phone}\n\nBest regards,\nRediHealth Staff`,
      };
    case "referral":
      return {
        subject: "RediHealth: Help & Next Steps",
        text: `Hello ${name},\n\nRegarding your enquiry, we recommend contacting your primary healthcare provider or local clinic. If you need assistance finding medical institutes in your area, please visit our Find Help map at https://redihealth.org/find-help.\n\nBest regards,\nRediHealth Staff`,
      };
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
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

    const template = getTemplate(templateId as ReplyTemplateId, requester);
    await sendEmail({ to: requester.email, ...template });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send request reply", error);
    return NextResponse.json(
      { error: "We could not send the email. Please try again." },
      { status: 502 },
    );
  }
}