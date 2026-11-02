import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  sendEmail: vi.fn(),
  checkRateLimit: vi.fn(),
}));

vi.mock("@/lib/database", () => ({
  getCountryDatabase: () => ({ query: mocks.query }),
  configuredCountries: () => ["RO", "IT"],
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
    mocks.checkRateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
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

  it("replaces a patient's token with a fresh Romanian portal link that expires", async () => {
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
      expect.stringContaining("DATE_ADD(NOW(), INTERVAL ? DAY)"),
      [expect.any(String), 90, 14],
    );
    expect(mocks.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      email: "ana@example.com",
      country: "RO",
      lang: "ro",
      accessToken: expect.any(String),
    }));
  });

  it("finds a patient registered in another country and issues the link for that country", async () => {
    mocks.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[
        { id: 3, full_name: "Marco", email: "marco@example.com", treatment_plan: null, condition_notes: null },
      ]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const response = await POST(request("marco@example.com", "it"));
    expect(response.status).toBe(200);
    expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
    expect(mocks.sendEmail).toHaveBeenCalledWith(expect.objectContaining({ country: "IT", email: "marco@example.com" }));
  });
});
