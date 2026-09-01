import {
  AccountApi,
  Configuration,
  SendApi,
  type V1SendRequest,
} from "hostinger-mail-api-sdk";

type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

let mailboxResourceId: string | undefined;

function getHostingerMailConfig() {
  const accessToken = process.env.HOSTINGER_MAIL_API_TOKEN;
  const fromAddress = process.env.HOSTINGER_MAIL_FROM;
  const displayName = process.env.HOSTINGER_MAIL_DISPLAY_NAME || "RediHealth";

  if (!accessToken || !fromAddress) {
    return null;
  }

  return { accessToken, fromAddress, displayName };
}

export function isEmailConfigured() {
  return getHostingerMailConfig() !== null;
}

export async function sendEmail({ to, subject, text, html }: EmailMessage) {
  const config = getHostingerMailConfig();
  if (!config) {
    throw new Error("Hostinger Mail API is not configured.");
  }

  const sdkConfig = new Configuration({ accessToken: config.accessToken });

  if (!mailboxResourceId) {
    const account = await new AccountApi(sdkConfig).getCurrentAccount();
    const mailbox = account.data.data.mailboxes.find(
      ({ address }) => address.toLowerCase() === config.fromAddress.toLowerCase(),
    );

    if (!mailbox) {
      throw new Error(
        `The Hostinger API token cannot manage ${config.fromAddress}.`,
      );
    }

    mailboxResourceId = mailbox.resourceId;
  }

  const message = {
    to: [to],
    displayName: config.displayName,
    subject,
    text,
    html: html || "",
  } as V1SendRequest;

  await new SendApi(sdkConfig).sendEmail(mailboxResourceId, message);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export type HelpRequestEmailParams = {
  name: string;
  phone: string;
  email: string;
  description: string;
};

export async function sendHelpRequestConfirmationEmail({
  name,
  phone,
  email,
  description,
}: HelpRequestEmailParams) {
  if (!isEmailConfigured()) {
    console.warn("Hostinger Mail API is not configured. Skipping confirmation email.");
    return false;
  }

  const recipientName = name.trim() || "Valued Customer";

  const textContent = `Hello ${recipientName},

Thank you for reaching out to RediHealth. We have received your request for medical help and our healthcare team will review it as soon as possible.

Summary of your request:
- Name: ${name.trim() || "Not provided"}
- Phone: ${phone.trim()}
- Email: ${email.trim()}
- Description: ${description.trim()}

IMPORTANT: RediHealth is not an emergency response service. If you are experiencing a life-threatening medical emergency, please call 112 or contact your local emergency services immediately.

Best regards,
The RediHealth Team`;

  const htmlContent = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
  <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="color: #2563eb; font-size: 22px; font-weight: 700; margin: 0;">RediHealth</h1>
  </div>
  
  <h2 style="font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0;">We received your medical help request</h2>
  
  <p style="font-size: 15px; line-height: 1.6; color: #334155;">Hello <strong>${escapeHtml(recipientName)}</strong>,</p>
  
  <p style="font-size: 15px; line-height: 1.6; color: #334155;">
    Thank you for reaching out to RediHealth. We have successfully received your request for medical assistance. Our healthcare team will review what you shared and get in touch with you shortly.
  </p>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 24px 0;">
    <h3 style="margin-top: 0; font-size: 15px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Request Summary</h3>
    <p style="margin: 8px 0; font-size: 14px; color: #334155;"><strong>Name:</strong> ${escapeHtml(name.trim() || "Not provided")}</p>
    <p style="margin: 8px 0; font-size: 14px; color: #334155;"><strong>Phone:</strong> ${escapeHtml(phone.trim())}</p>
    <p style="margin: 8px 0; font-size: 14px; color: #334155;"><strong>Email:</strong> ${escapeHtml(email.trim())}</p>
    <p style="margin: 8px 0 4px 0; font-size: 14px; color: #334155;"><strong>Description:</strong></p>
    <div style="font-size: 14px; color: #334155; white-space: pre-wrap; background-color: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 4px;">${escapeHtml(description.trim())}</div>
  </div>

  <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px; border-radius: 4px; font-size: 13px; line-height: 1.5; color: #991b1b; margin-bottom: 24px;">
    <strong>Emergency Notice:</strong> RediHealth is not an emergency response service. If you think you may be experiencing a medical emergency, please call <strong>112</strong> or your local emergency services immediately.
  </div>

  <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 0;">
    Best regards,<br />
    <strong>The RediHealth Team</strong>
  </p>
</div>
`;

  try {
    await sendEmail({
      to: email.trim(),
      subject: "Confirmation: Medical Help Request Received - RediHealth",
      text: textContent,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error("Failed to send medical help request confirmation email:", error);
    return false;
  }
}

export type PatientPortalEmailParams = {
  name: string;
  email: string;
  accessToken: string;
  treatmentPlan?: {
    diagnosis?: string;
    care_instructions?: string;
  } | null;
  conditionNotes?: string | null;
};

export async function sendPatientPortalLinkEmail({
  name,
  email,
  accessToken,
  treatmentPlan,
  conditionNotes,
}: PatientPortalEmailParams) {
  if (!isEmailConfigured()) {
    console.warn("Hostinger Mail API is not configured. Skipping patient portal email.");
    return false;
  }

  const recipientName = name.trim() || "Valued Customer";
  const baseUrl =
    process.env.APP_URL || process.env.AUTH_URL || "http://localhost:3000";
  const portalUrl = `${baseUrl.replace(/\/$/, "")}/patient-portal/${accessToken}`;

  const textContent = `Hello ${recipientName},

Your RediHealth Patient Profile & Portal Access is ready!

You can view your medical profile, condition notes, care instructions, report new symptoms, add photos, and request follow-ups by visiting your personal link:

${portalUrl}

${conditionNotes ? `Condition / Symptoms Summary:\n${conditionNotes}\n` : ""}
${treatmentPlan?.diagnosis ? `Diagnosis:\n${treatmentPlan.diagnosis}\n` : ""}
${treatmentPlan?.care_instructions ? `Care Directives:\n${treatmentPlan.care_instructions}\n` : ""}

IMPORTANT: RediHealth is not an emergency response service. If you are experiencing a life-threatening medical emergency, please call 112 or contact your local emergency services immediately.

Best regards,
The RediHealth Team`;

  const htmlContent = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
  <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="color: #2563eb; font-size: 22px; font-weight: 700; margin: 0;">RediHealth Patient Portal</h1>
  </div>
  
  <h2 style="font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0;">Your Medical Profile is Ready</h2>
  
  <p style="font-size: 15px; line-height: 1.6; color: #334155;">Hello <strong>${escapeHtml(recipientName)}</strong>,</p>
  
  <p style="font-size: 15px; line-height: 1.6; color: #334155;">
    Your patient profile has been created at RediHealth. You can now access your personal patient portal to view your treatment plan, report new symptoms, upload medical photos, and schedule follow-ups.
  </p>

  <div style="text-align: center; margin: 28px 0;">
    <a href="${portalUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">Access Your Patient Portal</a>
  </div>

  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 24px 0;">
    <h3 style="margin-top: 0; font-size: 15px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Portal Features Available to You:</h3>
    <ul style="margin: 8px 0; padding-left: 20px; font-size: 14px; color: #334155; line-height: 1.6;">
      <li>View your diagnosis & treatment plan</li>
      <li>Report new symptoms & update urgency status</li>
      <li>Schedule & track follow-up appointments</li>
      <li>Upload medical photos or document attachments</li>
    </ul>
  </div>

  <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px; border-radius: 4px; font-size: 13px; line-height: 1.5; color: #991b1b; margin-bottom: 24px;">
    <strong>Emergency Notice:</strong> RediHealth is not an emergency response service. If you think you may be experiencing a medical emergency, please call <strong>112</strong> or your local emergency services immediately.
  </div>

  <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 0;">
    Best regards,<br />
    <strong>The RediHealth Team</strong>
  </p>
</div>
`;

  try {
    await sendEmail({
      to: email.trim(),
      subject: "Your RediHealth Patient Portal & Care Plan Link",
      text: textContent,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error("Failed to send patient portal link email:", error);
    return false;
  }
}
