import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  sendEmail: vi.fn(),
  checkRateLimit: vi.fn(),
}));

vi.mock("@/lib/database", () => ({
  getDatabase: () => ({ query: mocks.query }),
}));
vi.mock("@/lib/email", () => ({
  isEmailConfigured: () => true,
  sendPatientPortalLinkEmail: mocks.sendEmail,
}));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mocks.checkRateLimit,
  getClientIp: () => "127.0.0.1",
}));

import { POST } from "./route";

describe("patient portal link recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkRateLimit.mockReturnValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.query.mockResolvedValue([[]]);
    mocks.sendEmail.mockResolvedValue(true);
  });

  function request(email: string, lang = "en") {
    return new Request("https://redihealth.org/api/patient-portal/request-link", {
      method: "POST",
      headers: { "content-type": "application/json", "x-redihealth-lang": lang },
      body: JSON.stringify({ email }),
    });
  }

  it("returns the same response when the email has no patient portal", async () => {
    const response = await POST(request("unknown@example.com"));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("replaces a patient's token with a permanent Romanian portal link", async () => {
    mocks.query
      .mockResolvedValueOnce([[
        { id: 14, full_name: "Ana", email: "ana@example.com", treatment_plan: null, condition_notes: null },
      ]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const response = await POST(request("ANA@example.com", "ro"));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true });
    expect(mocks.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("access_token_expires_at = NULL"),
      [expect.any(String), 14],
    );
    expect(mocks.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      email: "ana@example.com",
      lang: "ro",
      accessToken: expect.any(String),
    }));
  });
});
