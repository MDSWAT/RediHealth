import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";
import { ALERT_EMAIL_SETTING, getAlertRecipient, setSetting } from "@/lib/settings";
import { getClientIp } from "@/lib/rate-limit";
import { requireSuperAdmin } from "@/lib/super-admin";
import { isValidEmail, text } from "@/lib/text";

export async function GET() {
  const access = await requireSuperAdmin();
  if ("error" in access) return access.error;

  const recipient = await getAlertRecipient();
  return NextResponse.json({ alertEmail: recipient.email, source: recipient.source });
}

export async function PUT(request: Request) {
  const access = await requireSuperAdmin();
  if ("error" in access) return access.error;

  const body = (await request.json().catch(() => null)) as { alertEmail?: unknown } | null;
  if (!body || typeof body.alertEmail !== "string") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const alertEmail = text(body.alertEmail).toLowerCase();
  if (alertEmail && !isValidEmail(alertEmail)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    await setSetting(ALERT_EMAIL_SETTING, alertEmail || null, access.email);
    await logActivity({
      country: access.worker.country,
      actorWorkerId: access.worker.workerId,
      actorName: access.worker.workerName,
      actorEmail: access.email,
      actorRole: access.worker.role,
      action: "settings.alert_email_updated",
      entityType: "setting",
      entityId: ALERT_EMAIL_SETTING,
      details: { cleared: !alertEmail },
      ipAddress: getClientIp(request),
    });
  } catch (error) {
    console.error("Failed to save alert email setting", error);
    return NextResponse.json(
      { error: "Could not save the setting. Ensure migration 009 is applied." },
      { status: 503 },
    );
  }

  const recipient = await getAlertRecipient();
  return NextResponse.json({ alertEmail: recipient.email, source: recipient.source });
}
