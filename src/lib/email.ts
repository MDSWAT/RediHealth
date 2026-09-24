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
  displayName?: string;
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

export async function sendEmail({ to, subject, text, html, displayName }: EmailMessage) {
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
    displayName: displayName || config.displayName,
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

export type BrandEmailOptions = {
  previewText: string;
  badgeText?: string;
  heading: string;
  recipientName?: string;
  intro?: string;
  contentHtml?: string;
  codeBlock?: {
    code: string;
    expiresInText?: string;
  };
  cta?: {
    label: string;
    url: string;
  };
  emergencyNotice?: boolean;
  closingText?: string;
  footerReason?: string;
  align?: "center" | "left";
};

export function renderBrandEmail({
  previewText,
  badgeText,
  heading,
  recipientName,
  intro,
  contentHtml = "",
  codeBlock,
  cta,
  emergencyNotice = false,
  closingText = "Best regards,",
  footerReason = "You received this email regarding your RediHealth activity.",
  align = "center",
}: BrandEmailOptions) {
  const safePreviewText = escapeHtml(previewText);
  const safeHeading = escapeHtml(heading);
  const safeRecipientName = recipientName ? escapeHtml(recipientName) : "";
  const safeIntro = intro ? escapeHtml(intro) : "";
  const safeClosingText = escapeHtml(closingText);
  const safeFooterReason = escapeHtml(footerReason);
  const isCentered = align === "center";
  const textAlign = isCentered ? "center" : "left";

  const badgeHtml = badgeText
    ? `
      <tr>
        <td align="${textAlign}" style="padding: 0 0 12px 0;">
          <span class="email-badge" style="display: inline-block; font-size: 11px; line-height: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #cc3846; background-color: #fbeef0; padding: 4px 12px; border-radius: 9999px;">
            ${escapeHtml(badgeText)}
          </span>
        </td>
      </tr>`
    : "";

  const codeHtml = codeBlock
    ? `
      <tr>
        <td align="center" style="padding: 6px 0 20px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto; width: 100%; max-width: 360px;">
            <tr>
              <td class="email-box" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px 16px; text-align: center;">
                <div style="font-size: 11px; line-height: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; margin-bottom: 8px;">
                  Verification Code
                </div>
                <div class="email-code-digits" style="font-family: ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace; font-size: 38px; line-height: 44px; font-weight: 800; letter-spacing: 8px; text-indent: 8px; color: #0f172a; margin: 4px 0 8px 0;">
                  ${escapeHtml(codeBlock.code)}
                </div>
                <div class="email-subtext" style="font-size: 12px; line-height: 16px; color: #94a3b8; font-weight: 500;">
                  Expires in ${escapeHtml(codeBlock.expiresInText || "10 minutes")} · Do not share this code
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  const ctaHtml = cta
    ? `
      <tr>
        <td align="${textAlign}" style="padding: 10px 0 24px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${textAlign === "center" ? "center" : "left"}" style="${textAlign === "center" ? "margin: 0 auto;" : ""}">
            <tr>
              <td style="border-radius: 10px; background-color: #cc3846;">
                <a href="${escapeHtml(cta.url)}" class="button-link" style="display: inline-block; padding: 13px 30px; font-size: 15px; line-height: 20px; font-weight: 600; color: #ffffff !important; text-decoration: none; border-radius: 10px; background-color: #cc3846;">
                  ${escapeHtml(cta.label)}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  const emergencyHtml = emergencyNotice
    ? `
      <tr>
        <td style="padding: 8px 0 20px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0; background-color: #fff9f9; border: 1px solid #fee2e2; border-left: 3px solid #cc3846; border-radius: 10px;">
            <tr>
              <td style="padding: 12px 16px; font-size: 13px; line-height: 20px; color: #991b1b; text-align: left;">
                <strong style="color: #991b1b;">Emergency Notice:</strong> RediHealth is not an emergency response service. If you are experiencing a life-threatening medical emergency, please call <strong>112</strong> immediately.
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  const greetingHtml = safeRecipientName
    ? `<tr><td class="email-body-text" style="padding: 0 0 10px 0; font-size: 15px; line-height: 24px; color: #334155; text-align: ${textAlign};">Hello <strong>${safeRecipientName}</strong>,</td></tr>`
    : "";

  const introHtml = safeIntro
    ? `<tr><td class="email-body-text" style="padding: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #475569; text-align: ${textAlign};">${safeIntro}</td></tr>`
    : "";

  const previewSpacingFiller = "&#847;&zwnj;&nbsp;".repeat(90);

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${safeHeading}</title>
    <style>
      :root {
        color-scheme: light dark;
        supported-color-schemes: light dark;
      }
      body, table, td, a {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table, td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      img {
        -ms-interpolation-mode: bicubic;
        border: 0;
      }
      a {
        color: #cc3846;
      }
      a[x-apple-data-detectors],
      #MessageViewBody a,
      u + #body a {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }
      .button-link,
      .button-link:visited {
        color: #ffffff !important;
        text-decoration: none !important;
      }
      @media (prefers-color-scheme: dark) {
        body, #body, .email-bg {
          background-color: #0b0f17 !important;
        }
        .email-card {
          background-color: #141c2b !important;
          border-color: #223048 !important;
        }
        .email-brand-name {
          color: #f8fafc !important;
        }
        .email-heading {
          color: #f8fafc !important;
        }
        .email-body-text {
          color: #cbd5e1 !important;
        }
        .email-subtext {
          color: #94a3b8 !important;
        }
        .email-box {
          background-color: #0d1420 !important;
          border-color: #223048 !important;
        }
        .email-code-digits {
          color: #ffffff !important;
        }
        .email-badge {
          background-color: #271d24 !important;
          color: #f87171 !important;
        }
        .email-footer-text {
          color: #64748b !important;
        }
        .email-border {
          border-color: #223048 !important;
        }
      }
      @media screen and (max-width: 600px) {
        .email-container {
          width: 100% !important;
        }
        .email-card {
          border-radius: 12px !important;
          padding: 28px 20px !important;
        }
        .email-heading {
          font-size: 21px !important;
          line-height: 28px !important;
        }
      }
    </style>
  </head>
  <body id="body" class="email-bg" style="margin: 0; padding: 0; width: 100% !important; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
      ${safePreviewText} ${previewSpacingFiller}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-bg" style="background-color: #f8fafc;">
      <tr>
        <td align="center" style="padding: 40px 14px 44px 14px;">
          <table role="presentation" class="email-container" width="540" cellpadding="0" cellspacing="0" border="0" align="center" style="width: 540px; max-width: 540px; margin: 0 auto;">
            <!-- Main White Card -->
            <tr>
              <td class="email-card" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 36px 32px 32px 32px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  ${badgeHtml}
                  <tr>
                    <td class="email-heading" style="padding: 0 0 14px 0; font-size: 23px; line-height: 30px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; text-align: ${textAlign};">
                      ${safeHeading}
                    </td>
                  </tr>
                  ${greetingHtml}
                  ${introHtml}
                  ${codeHtml}
                  ${ctaHtml}
                  ${contentHtml}
                  ${emergencyHtml}
                  <tr>
                    <td class="email-subtext" style="padding: 12px 0 0 0; font-size: 14px; line-height: 22px; color: #64748b; text-align: ${textAlign};">
                      ${safeClosingText}<br />
                      <strong class="email-brand-name" style="color: #0f172a;">The RediHealth Team</strong>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Minimal Modern Footer -->
            <tr>
              <td align="center" style="padding: 24px 16px 0 16px; text-align: center;">
                <p class="email-footer-text" style="margin: 0 0 6px 0; font-size: 12px; line-height: 18px; color: #64748b; font-weight: 500;">
                  RediHealth · Healthcare Support &amp; Patient Portal
                </p>
                <p class="email-footer-text" style="margin: 0 0 8px 0; font-size: 12px; line-height: 18px; color: #94a3b8;">
                  ${safeFooterReason}
                </p>
                <p class="email-footer-text" style="margin: 0; font-size: 12px; line-height: 18px; color: #94a3b8;">
                  Questions or feedback? <a href="mailto:support@redihealth.app" style="color: #cc3846; text-decoration: underline;">Contact Support</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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

  const summaryHtml = `
      <tr>
        <td style="padding: 0 0 20px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
            <tr>
              <td style="padding: 14px 18px; font-size: 13px; line-height: 18px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em;">
                Request Summary
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 18px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 22px; color: #475569;"><strong style="color: #0f172a;">Name:</strong> ${escapeHtml(name.trim() || "Not provided")}</p>
                <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 22px; color: #475569;"><strong style="color: #0f172a;">Phone:</strong> ${escapeHtml(phone.trim())}</p>
                <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 22px; color: #475569;"><strong style="color: #0f172a;">Email:</strong> ${escapeHtml(email.trim())}</p>
                <p style="margin: 0 0 6px 0; font-size: 14px; line-height: 22px; color: #475569;"><strong style="color: #0f172a;">Description:</strong></p>
                <div style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; font-size: 14px; line-height: 22px; color: #334155; white-space: pre-wrap;">${escapeHtml(description.trim())}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;

  const htmlContent = renderBrandEmail({
    previewText: "Your RediHealth medical help request has been received.",
    badgeText: "Request Received",
    heading: "We received your request",
    recipientName,
    intro:
      "Thank you for reaching out to RediHealth. Our healthcare team has received your medical assistance request and will review it shortly.",
    contentHtml: summaryHtml,
    emergencyNotice: true,
    footerReason: "You received this email because a medical assistance request was submitted for this address.",
  });

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
  /** Origin of the incoming request (e.g. https://example.com). Used as a fallback when APP_URL is not set. */
  baseUrl?: string;
};

export async function sendPatientPortalLinkEmail({
  name,
  email,
  accessToken,
  treatmentPlan,
  conditionNotes,
  baseUrl: requestBaseUrl,
}: PatientPortalEmailParams) {
  if (!isEmailConfigured()) {
    console.warn("Hostinger Mail API is not configured. Skipping patient portal email.");
    return false;
  }

  const recipientName = name.trim() || "Valued Customer";
  const baseUrl =
    process.env.APP_URL ||
    requestBaseUrl ||
    process.env.AUTH_URL ||
    "http://localhost:3000";
  const portalUrl = `${baseUrl.replace(/\/$/, "")}/patient-portal/${accessToken}`;
  const configuredTtlDays = Number(process.env.PATIENT_PORTAL_TOKEN_TTL_DAYS || 30);
  const tokenTtlDays = Number.isFinite(configuredTtlDays) && configuredTtlDays > 0
    ? configuredTtlDays
    : 30;

  const textContent = `Hello ${recipientName},

Your RediHealth Patient Profile & Portal Access is ready!

You can view your medical profile, condition notes, care instructions, report new symptoms, add photos, and request follow-ups by visiting your personal link:

${portalUrl}

This link expires in ${tokenTtlDays} day${tokenTtlDays === 1 ? "" : "s"}.

${conditionNotes ? `Condition / Symptoms Summary:\n${conditionNotes}\n` : ""}
${treatmentPlan?.diagnosis ? `Diagnosis:\n${treatmentPlan.diagnosis}\n` : ""}
${treatmentPlan?.care_instructions ? `Care Directives:\n${treatmentPlan.care_instructions}\n` : ""}

IMPORTANT: RediHealth is not an emergency response service. If you are experiencing a life-threatening medical emergency, please call 112 or contact your local emergency services immediately.

Best regards,
The RediHealth Team`;

  const portalDetailsHtml = `
      <tr>
        <td align="center" style="padding: 0 0 16px 0; font-size: 13px; line-height: 20px; color: #64748b;">
          This secure portal link expires in <strong>${tokenTtlDays} day${tokenTtlDays === 1 ? "" : "s"}</strong>.
        </td>
      </tr>
      <tr>
        <td style="padding: 0 0 20px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
            <tr>
              <td style="padding: 14px 18px; font-size: 13px; line-height: 18px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em;">
                In your patient portal
              </td>
            </tr>
            <tr>
              <td style="padding: 14px 18px; font-size: 14px; line-height: 22px; color: #475569;">
                <ul style="margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 6px;">View diagnosis and care plan directives</li>
                  <li style="margin-bottom: 6px;">Report new symptoms and monitor urgency level</li>
                  <li style="margin-bottom: 6px;">Schedule and attend follow-up video visits</li>
                  <li>Upload medical photos or relevant health documents</li>
                </ul>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;

  const htmlContent = renderBrandEmail({
    previewText: "Your RediHealth patient portal is ready.",
    badgeText: "Patient Portal",
    heading: "Your medical portal is ready",
    recipientName,
    intro:
      "Your personal patient portal is now active. Access your profile to review your care instructions, report symptoms, and connect with your care team.",
    cta: {
      label: "Open Patient Portal",
      url: portalUrl,
    },
    contentHtml: portalDetailsHtml,
    emergencyNotice: true,
    footerReason: "You received this email because a patient profile was created for you on RediHealth.",
  });

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

export async function sendMeetingInvitationEmail({
  name,
  email,
  title,
  meetingUrl,
}: {
  name: string;
  email: string;
  title: string;
  meetingUrl: string;
}) {
  if (!isEmailConfigured()) {
    console.warn("Hostinger Mail API is not configured. Skipping meeting invitation email.");
    return false;
  }

  const recipientName = name.trim() || "Patient";
  const textContent = `Hello ${recipientName},

You have been invited to a RediHealth video appointment: ${title}.

Join the meeting at:
${meetingUrl}

If you need help joining, please contact your healthcare team.

Best regards,
The RediHealth Team`;
  const meetingDetailsHtml = `
      <tr>
        <td style="padding: 0 0 20px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
            <tr>
              <td style="padding: 16px 18px; font-size: 14px; line-height: 22px; color: #475569; text-align: center;">
                <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">Scheduled Appointment</div>
                <div style="font-size: 16px; font-weight: 700; color: #0f172a;">${escapeHtml(title)}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;

  const htmlContent = renderBrandEmail({
    previewText: `Video appointment invitation: ${title}`,
    badgeText: "Video Appointment",
    heading: "You're invited to a video visit",
    recipientName,
    intro:
      "A video consultation has been scheduled with your healthcare support team. When it is time for your appointment, tap the button below to join directly in your browser.",
    cta: {
      label: "Join Video Visit",
      url: meetingUrl,
    },
    contentHtml: meetingDetailsHtml,
    closingText: "If you need help connecting, please contact your healthcare team.",
    footerReason: "You received this email because an appointment was scheduled for you on RediHealth.",
  });

  try {
    await sendEmail({
      to: email,
      subject: `Invitation: ${title} - RediHealth`,
      text: textContent,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error("Failed to send meeting invitation email:", error);
    return false;
  }
}
