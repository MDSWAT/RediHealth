import { isEmailConfigured, renderBrandEmail, sendEmail } from "@/lib/email";

type OperationalAlertInput = {
  key: string;
  title: string;
  summary: string;
  source: string;
  severity?: "info" | "warning" | "critical";
  details?: Record<string, unknown>;
  cooldownMs?: number;
};

const lastSentByKey = new Map<string, number>();
const DEFAULT_ALERT_EMAIL = "babinciucmihai4@gmail.com";
const DEFAULT_COOLDOWN_MS = 15 * 60_000;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDetails(details?: Record<string, unknown>): string {
  if (!details) return "";
  const lines = Object.entries(details)
    .slice(0, 12)
    .map(([key, value]) => `${key}: ${String(value)}`);
  return lines.join("\n");
}

export async function notifyOperationalIssue(input: OperationalAlertInput) {
  const now = Date.now();
  const cooldownMs = input.cooldownMs ?? DEFAULT_COOLDOWN_MS;
  const previous = lastSentByKey.get(input.key);
  if (previous && now - previous < cooldownMs) {
    return false;
  }

  const toAddress = (process.env.OPERATIONAL_ALERT_EMAIL || DEFAULT_ALERT_EMAIL).trim();
  if (!toAddress || !isEmailConfigured()) {
    return false;
  }

  const severity = input.severity || "warning";
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
    badgeText: severity === "critical" ? "Critical Alert" : severity === "warning" ? "Warning Alert" : "Info Alert",
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
      to: toAddress,
      subject: `[RediHealth ${severity.toUpperCase()}] ${input.title}`,
      text: textBody,
      html: htmlBody,
      displayName: "RediHealth Ops Alerts",
    });
    lastSentByKey.set(input.key, now);
    return true;
  } catch (error) {
    console.error("Failed to send operational alert", error);
    return false;
  }
}
