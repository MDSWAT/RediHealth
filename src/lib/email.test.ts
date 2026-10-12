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
} from "@/lib/email";

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
    expect(sentMessage.text).toContain("Acest link securizat către portal nu expiră.");
    expect(sentMessage.text).not.toContain("30 de zile");
    expect(sentMessage.html).toContain("Portalul pacientului");
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
});
