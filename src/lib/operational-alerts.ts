import { isEmailConfigured, renderBrandEmail, sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { getAlertRecipients } from "@/lib/settings";
import { escapeHtml } from "@/lib/text";

type OperationalAlertInput = {
  key: string;
  title: string;
  summary: string;
  source: string;
  severity?: "info" | "warning" | "critical";
  details?: Record<string, unknown>;
  cooldownMs?: number;
  hourlyCap?: { key: string; limit: number };
};

const DEFAULT_COOLDOWN_MS = 15 * 60_000;

function formatDetails(details?: Record<string, unknown>): string {
  if (!details) return "";
  const lines = Object.entries(details)
    .slice(0, 12)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}: ${String(value)}`);
  return lines.join("\n");
}

export async function notifyOperationalIssue(input: OperationalAlertInput) {
  // Email is reserved for explicitly critical failures. Warning/info events must not
  // perform recipient lookups or consume the critical alert rate-limit budget.
  if (input.severity !== "critical") return false;

  const { emails: recipients } = await getAlertRecipients();
  if (recipients.length === 0 || !isEmailConfigured()) {
    return false;
  }

  // One alert per key per cooldown window, shared across server instances.
  const cooldown = await checkRateLimit(`operational-alert:${input.key}`, {
    limit: 1,
    windowMs: input.cooldownMs ?? DEFAULT_COOLDOWN_MS,
  });
  if (!cooldown.allowed) {
    return false;
  }

  // Optional ceiling shared by a whole class of alerts, so a burst of different errors cannot flood the inbox.
  if (input.hourlyCap) {
    const cap = await checkRateLimit(`operational-alert-cap:${input.hourlyCap.key}`, {
      limit: input.hourlyCap.limit,
      windowMs: 60 * 60_000,
    });
    if (!cap.allowed) {
      return false;
    }
  }

  const severity = input.severity;
  const timestamp = new Date().toISOString();
  const detailsText = formatDetails(input.details);

  const textBody = [
    `[${severity.toUpperCase()}] ${input.title}`,
    "",
    `Source: ${input.source}`,
    `Detected at (UTC): ${timestamp}`,
    "",
    input.summary,
    detailsText ? `\nDetails:\n${detailsText}` : "",
  ].join("\n");

  const detailsHtml = detailsText
    ? `
      <tr>
        <td style="padding: 0 0 16px 0;">
          <div style="white-space: pre-wrap; border: 1px solid #e2e8f0; background-color: #f8fafc; border-radius: 10px; padding: 12px; font-size: 13px; line-height: 20px; color: #334155;">${escapeHtml(detailsText)}</div>
        </td>
      </tr>`
    : "";

  const htmlBody = renderBrandEmail({
    previewText: `Operational alert: ${input.title}`,
    badgeText: "Critical Alert",
    heading: input.title,
    intro: input.summary,
    align: "left",
    contentHtml: `
      <tr>
        <td style="padding: 0 0 14px 0; font-size: 13px; line-height: 20px; color: #475569;">
          <p style="margin: 0 0 6px 0;"><strong style="color: #0f172a;">Source:</strong> ${escapeHtml(input.source)}</p>
          <p style="margin: 0;"><strong style="color: #0f172a;">Detected at (UTC):</strong> ${escapeHtml(timestamp)}</p>
        </td>
      </tr>
      ${detailsHtml}`,
    closingText: "This is an automated RediHealth operational alert.",
    footerReason: "You received this email because operational alerting is enabled.",
  });

  try {
    await sendEmail({
      to: recipients,
      subject: `[RediHealth ${severity.toUpperCase()}] ${input.title}`,
      text: textBody,
      html: htmlBody,
      displayName: "RediHealth Ops Alerts",
    });
    return true;
  } catch (error) {
    console.error("Failed to send operational alert", error);
    return false;
  }
}
