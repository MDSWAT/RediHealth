import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mailMocks = vi.hoisted(() => ({
  send: vi.fn(),
  apiKeys: [] as string[],
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: mailMocks.send,
    };
    constructor(apiKey: string) {
      mailMocks.apiKeys.push(apiKey);
    }
  },
}));

import {
  isEmailConfigured,
  sendEmail,
  sendMeetingInvitationEmail,
  sendPatientPortalLinkEmail,
  sendHelpRequestConfirmationEmail,
  renderBrandEmail,
  renderHelpRequestReplyEmail,
  renderSignInCodeEmail,
} from "@/lib/email";
import { languages } from "@/lib/i18n/translations";
import { emailTranslations, helpReplyContent, type ReplyTemplateId } from "@/lib/i18n/email-translations";

describe("Resend transport and RediHealth email templates", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key_123");
    vi.stubEnv("EMAIL_FROM", "no-reply@redi.healthcare");
    vi.stubEnv("EMAIL_DISPLAY_NAME", "RediHealth");
    vi.stubEnv("EMAIL_REPLY_TO", "contact@redi.healthcare");
    mailMocks.apiKeys.length = 0;
    mailMocks.send.mockResolvedValue({ data: { id: "email-id-1" }, error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("reports configured state strictly from RESEND_API_KEY and sends clean Resend payloads", async () => {
    expect(isEmailConfigured()).toBe(true);
    await sendEmail({
      to: "user@example.com",
      subject: "Test subject",
      text: "Hello plain",
      html: "<p>Hello HTML</p>",
    });

    expect(mailMocks.send).toHaveBeenCalledWith({
      from: "RediHealth <no-reply@redi.healthcare>",
      to: ["user@example.com"],
      replyTo: "contact@redi.healthcare",
      subject: "Test subject",
      text: "Hello plain",
      html: "<p>Hello HTML</p>",
    });

    vi.stubEnv("RESEND_API_KEY", "");
    expect(isEmailConfigured()).toBe(false);
  });

  it("propagates Resend HTTP statusCode on error.response.status for safe route logging", async () => {
    mailMocks.send.mockResolvedValueOnce({
      data: null,
      error: { message: "Invalid API key", statusCode: 401, name: "validation_error" },
    });

    await expect(
      sendEmail({ to: "user@example.com", subject: "Auth test", text: "Code" }),
    ).rejects.toMatchObject({
      name: "ResendDeliveryError",
      response: { status: 401 },
    });
  });

  it("renders brand header, Deep Sapphire CTA, sentence-cased badges, and dark-mode styling", () => {
    const signIn = renderSignInCodeEmail({ email: "staff@example.com", code: "482910", lang: "en" });
    expect(signIn.html).toContain("https://redi.healthcare/pwa/pwa-192x192.png");
    expect(signIn.html).toContain("#1d3557");
    expect(signIn.html).toContain("#fcfbf9");
    expect(signIn.html).toContain("prefers-color-scheme: dark");
    expect(signIn.html).not.toContain("text-transform: uppercase");
    expect(signIn.html).not.toContain("border-radius: 9999px");
    expect(signIn.html).toContain("Verification code");
    expect(signIn.html).toContain("Contact support");
    expect(signIn.html).toContain("The RediHealth team");
    expect(signIn.html).not.toContain("Verification Code");
    expect(signIn.html).not.toContain("Contact Support");
    expect(signIn.html).not.toContain("The RediHealth Team");
    expect(signIn.html).toContain("482910");
    expect(signIn.text).toMatch(/^482910$/m);

    const alertHtml = renderBrandEmail({
      lang: "en",
      previewText: "Critical alert",
      badgeText: "Critical alert",
      heading: "Database unavailable",
    });
    expect(alertHtml).toContain("email-badge-critical");
    expect(alertHtml).toContain("#c62f3c");
  });

  it("sends patient portal links in the selected Romanian language", async () => {
    await expect(sendPatientPortalLinkEmail({
      name: "Ana",
      email: "ana@example.com",
      accessToken: "secure-token",
      country: "RO",
      lang: "ro",
    })).resolves.toBe(true);

    expect(mailMocks.send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "RediHealth <no-reply@redi.healthcare>",
        to: ["ana@example.com"],
        subject: expect.stringContaining("portalul"),
        text: expect.stringContaining("Bună Ana"),
        html: expect.stringContaining('<html lang="ro"'),
      }),
    );
    const sentMessage = mailMocks.send.mock.calls[0][0] as { text: string; html: string };
    expect(sentMessage.text).toContain("Profilul tău RediHealth");
    expect(sentMessage.text).not.toContain("Your RediHealth patient profile");
    expect(sentMessage.text).toContain("Acest link securizat către portal este valabil 90 de zile.");
    expect(sentMessage.text).not.toContain("30 de zile");
    expect(sentMessage.html).toContain("Portalul pacientului");
    expect(sentMessage.text).toContain("/patient-portal/secure-token?c=ro");
  });

  it("sends appointment invitations in the selected Romanian language", async () => {
    await expect(sendMeetingInvitationEmail({
      name: "Ana",
      email: "ana@example.com",
      title: "Consultație de urmărire",
      meetingUrl: "https://meet.example.com/appointment",
      lang: "ro",
    })).resolves.toBe(true);

    expect(mailMocks.send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "RediHealth <no-reply@redi.healthcare>",
        to: ["ana@example.com"],
        subject: expect.stringContaining("Invitație"),
        text: expect.stringContaining("Ai fost invitat(ă)"),
        html: expect.stringContaining('<html lang="ro"'),
      }),
    );
  });

  it.each(languages.filter(language => language.code !== "en"))("localizes confirmations in $code", async ({ code }) => {
    await sendHelpRequestConfirmationEmail({ name: "Ana", phone: "000123456", email: "ana@example.com", description: "Synthetic <script>example</script>", lang: code });
    const message = mailMocks.send.mock.calls[0][0] as { subject: string; text: string; html: string };
    expect(message.html).toContain(`<html lang="${code}"`);
    expect(message.subject).not.toContain("medical help request received");
    expect(message.text).not.toContain("Thank you for reaching out");
    expect(message.html).not.toContain("<script>example</script>");
    expect(message.html).toContain("&lt;script&gt;example&lt;/script&gt;");
  });

  it.each(languages.filter(language => language.code !== "en"))("localizes code-box and default footer text in $code", ({ code }) => {
    const html = renderBrandEmail({ lang: code, previewText: "Example", heading: "Example", codeBlock: { code: "123456" } });
    expect(html).not.toContain("Verification code");
    expect(html).not.toContain("Expires in");
    expect(html).not.toContain("Do not share this code");
    expect(html).not.toContain("Best regards");
    expect(html).not.toContain("You received this email regarding");
    expect(html).toContain("123456");
  });

  it.each(languages)("uses the same localized text for previews and sent replies in $code", ({ code }) => {
    for (const templateId of ["acknowledgment", "consultation", "referral"] satisfies ReplyTemplateId[]) {
      const input = { templateId, lang: code, name: "Ana <test>", phone: "000123456", description: "Synthetic <script>example</script>" };
      const message = renderHelpRequestReplyEmail(input);
      expect(message.text).toBe(helpReplyContent(input).text);
      expect(message.html.includes(`<html lang="${code}"`)).toBe(true);
      expect(message.subject).toBe(`RediHealth: ${emailTranslations[code].reply.templates[templateId].subject}`);
      expect(message.html.includes("<script>example</script>")).toBe(false);
      if (templateId === "referral") expect(message.html.includes(`https://redi.healthcare/${code}/find-help`)).toBe(true);
    }
  });

  it.each(languages)("localizes portal and meeting emails in $code", async ({ code }) => {
    await sendPatientPortalLinkEmail({ name: "Ana", email: "ana@example.com", accessToken: "secure-token", country: "RO", lang: code });
    await sendMeetingInvitationEmail({ name: "Ana", email: "ana@example.com", title: "Synthetic appointment", meetingUrl: `https://redihealth.org/${code}/medic-online/meet/example`, lang: code });
    for (const call of mailMocks.send.mock.calls) {
      expect((call[0] as { html: string }).html.includes(`<html lang="${code}"`)).toBe(true);
    }
    expect((mailMocks.send.mock.calls[0][0] as { text: string }).text.includes(`/${code}/patient-portal/secure-token?c=ro`)).toBe(true);
  });

  it("ignores request baseUrl and derives patient portal link origin strictly from server config", async () => {
    vi.stubEnv("APP_URL", "");
    vi.stubEnv("AUTH_URL", "https://portal.redi.healthcare");

    await sendPatientPortalLinkEmail({
      name: "Ana",
      email: "ana@example.com",
      accessToken: "secure-token-xyz",
      country: "RO",
      lang: "ro",
      baseUrl: "https://attacker.evil.example",
    });

    const sent = mailMocks.send.mock.calls[0][0] as { text: string; html: string };
    expect(sent.text).toContain("https://portal.redi.healthcare/ro/patient-portal/secure-token-xyz?c=ro");
    expect(sent.html).toContain("https://portal.redi.healthcare/ro/patient-portal/secure-token-xyz?c=ro");
    expect(sent.text).not.toContain("attacker.evil.example");
    expect(sent.html).not.toContain("attacker.evil.example");
  });
});
