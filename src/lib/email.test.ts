import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mailMocks = vi.hoisted(() => ({
  getAccount: vi.fn(),
  send: vi.fn(),
}));

vi.mock("hostinger-mail-api-sdk", () => ({
  AccountApi: class {
    getCurrentAccount = mailMocks.getAccount;
  },
  Configuration: class {},
  SendApi: class {
    sendEmail = mailMocks.send;
  },
}));

import {
  sendMeetingInvitationEmail,
  sendPatientPortalLinkEmail,
  sendHelpRequestConfirmationEmail,
  renderBrandEmail,
  renderHelpRequestReplyEmail,
} from "@/lib/email";
import { languages } from "@/lib/i18n/translations";
import { emailTranslations, helpReplyContent, type ReplyTemplateId } from "@/lib/i18n/email-translations";

describe("panel email localization", () => {
  beforeEach(() => {
    vi.stubEnv("HOSTINGER_MAIL_API_TOKEN", "test-token");
    vi.stubEnv("HOSTINGER_MAIL_FROM", "no-reply@example.com");
    mailMocks.getAccount.mockResolvedValue({
      data: { data: { mailboxes: [{ address: "no-reply@example.com", resourceId: "mailbox-1" }] } },
    });
    mailMocks.send.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
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
      "mailbox-1",
      expect.objectContaining({
        subject: expect.stringContaining("portalul"),
        text: expect.stringContaining("Bună Ana"),
        html: expect.stringContaining('<html lang="ro"'),
      }),
    );
    const sentMessage = mailMocks.send.mock.calls[0][1] as { text: string; html: string };
    expect(sentMessage.text).toContain("Profilul tău RediHealth");
    expect(sentMessage.text).not.toContain("Your RediHealth Patient Profile");
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
      "mailbox-1",
      expect.objectContaining({
        subject: expect.stringContaining("Invitație"),
        text: expect.stringContaining("Ai fost invitat(ă)"),
        html: expect.stringContaining('<html lang="ro"'),
      }),
    );
  });

  it.each(languages.filter(language => language.code !== "en"))("localizes confirmations in $code", async ({ code }) => {
    await sendHelpRequestConfirmationEmail({ name: "Ana", phone: "000123456", email: "ana@example.com", description: "Synthetic <script>example</script>", lang: code });
    const message = mailMocks.send.mock.calls[0][1] as { subject: string; text: string; html: string };
    expect(message.html).toContain(`<html lang="${code}"`);
    expect(message.subject).not.toContain("Medical Help Request Received");
    expect(message.text).not.toContain("Thank you for reaching out");
    expect(message.html).not.toContain("<script>example</script>");
    expect(message.html).toContain("&lt;script&gt;example&lt;/script&gt;");
  });

  it.each(languages.filter(language => language.code !== "en"))("localizes code-box and default footer text in $code", ({ code }) => {
    const html = renderBrandEmail({ lang: code, previewText: "Example", heading: "Example", codeBlock: { code: "123456" } });
    expect(html).not.toContain("Verification Code");
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
      if (templateId === "referral") expect(message.html.includes(`https://redihealth.org/${code}/find-help`)).toBe(true);
    }
  });

  it.each(languages)("localizes portal and meeting emails in $code", async ({ code }) => {
    await sendPatientPortalLinkEmail({ name: "Ana", email: "ana@example.com", accessToken: "secure-token", country: "RO", lang: code });
    await sendMeetingInvitationEmail({ name: "Ana", email: "ana@example.com", title: "Synthetic appointment", meetingUrl: `https://redihealth.org/${code}/medic-online/meet/example`, lang: code });
    for (const call of mailMocks.send.mock.calls) {
      expect((call[1] as { html: string }).html.includes(`<html lang="${code}"`)).toBe(true);
    }
    expect((mailMocks.send.mock.calls[0][1] as { text: string }).text.includes(`/${code}/patient-portal/secure-token?c=ro`)).toBe(true);
  });
});
