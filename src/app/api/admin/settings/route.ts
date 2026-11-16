import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";
import { ALERT_EMAIL_SETTING, MAX_ALERT_RECIPIENTS, getAlertRecipients, setSetting } from "@/lib/settings";
import { getClientIp } from "@/lib/rate-limit";
import { requireSuperAdmin } from "@/lib/super-admin";
import { isValidEmail, text } from "@/lib/text";

export async function GET() {
  const access = await requireSuperAdmin();
  if ("error" in access) return access.error;

  const recipients = await getAlertRecipients();
  return NextResponse.json({ alertEmails: recipients.emails, source: recipients.source });
}

export async function PUT(request: Request) {
  const access = await requireSuperAdmin();
  if ("error" in access) return access.error;

  const body = (await request.json().catch(() => null)) as { alertEmails?: unknown } | null;
  if (!body || !Array.isArray(body.alertEmails)) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const typed = body.alertEmails.map((value) => text(value).toLowerCase()).filter(Boolean);
  if (typed.some((email) => !isValidEmail(email))) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const alertEmails = [...new Set(typed)];
  if (alertEmails.length > MAX_ALERT_RECIPIENTS) {
    return NextResponse.json({ error: `Add at most ${MAX_ALERT_RECIPIENTS} addresses.` }, { status: 400 });
  }

  try {
    await setSetting(ALERT_EMAIL_SETTING, alertEmails.join(", ") || null, access.email);
    await logActivity({
      country: access.worker.country,
      actorWorkerId: access.worker.workerId,
      actorName: access.worker.workerName,
      actorEmail: access.email,
      actorRole: access.worker.role,
      action: "settings.alert_email_updated",
      entityType: "setting",
      entityId: ALERT_EMAIL_SETTING,
      details: { cleared: alertEmails.length === 0, recipients: alertEmails.length },
      ipAddress: getClientIp(request),
    });
  } catch (error) {
    console.error("Failed to save alert email setting", error);
    return NextResponse.json(
      { error: "Could not save the setting. Ensure migration 009 is applied." },
      { status: 503 },
    );
  }

  const recipients = await getAlertRecipients();
  return NextResponse.json({ alertEmails: recipients.emails, source: recipients.source });
}
