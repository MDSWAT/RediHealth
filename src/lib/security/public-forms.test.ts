import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const mocks = vi.hoisted(() => ({
  captcha: vi.fn(),
  auth: vi.fn(),
  worker: vi.fn(),
  query: vi.fn(),
  sendEmail: vi.fn(),
  lookup: vi.fn(),
  generate: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/worker-auth", () => ({ getUserWorkerContext: mocks.worker }));
vi.mock("@/lib/security/recaptcha", () => ({ verifyRecaptcha: mocks.captcha }));
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: async () => ({ allowed: true }),
  getClientIp: () => "127.0.0.1",
}));
vi.mock("@/lib/database", () => ({
  getCountryDatabase: () => ({ query: mocks.query }),
  configuredCountries: () => ["RO"],
}));
vi.mock("@/lib/email", () => ({
  isEmailConfigured: () => true,
  renderBrandEmail: () => "<p>report</p>",
  sendEmail: mocks.sendEmail,
  sendHelpRequestConfirmationEmail: mocks.sendEmail,
}));
vi.mock("@/lib/settings", () => ({ getAlertRecipient: async () => ({ email: "alerts@example.com" }) }));
vi.mock("@/lib/data/portal", () => ({ findPatientByPortalToken: mocks.lookup }));
vi.mock("@/lib/llm", () => ({ generateText: mocks.generate, LlmError: class extends Error {} }));
vi.mock("@/lib/operational-alerts", () => ({ notifyOperationalIssue: vi.fn() }));
vi.mock("@/lib/activity-log", () => ({ logActivity: vi.fn() }));

import { POST as helpRequest } from "@/app/api/medical-help-requests/route";
import { POST as issueReport } from "@/app/api/report-issue/route";
import { POST as assistant } from "@/app/api/health-assistant/route";
import { PATCH as portal } from "@/app/api/patient-portal/[token]/route";

const handlers = [
  { action: "help_request", handler: (request: Request) => helpRequest(request) },
  { action: "issue_report", handler: (request: Request) => issueReport(request) },
  { action: "health_assistant", handler: (request: Request) => assistant(request) },
  { action: "patient_portal", handler: (request: Request) => portal(request, { params: Promise.resolve({ token: "a".repeat(32) }) }) },
];

describe("public form CAPTCHA enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue(null);
    mocks.captcha.mockImplementation(async () =>
      NextResponse.json({ error: "Bot verification failed.", code: "captcha_invalid" }, { status: 400 }),
    );
    mocks.sendEmail.mockResolvedValue(undefined);
  });

  it.each(handlers)("blocks $action before database, email, AI, or portal access", async ({ handler, action }) => {
    const request = new Request("https://redihealth.org/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ captchaToken: "invalid-token" }),
    });
    const response = await handler(request);
    expect(response.status).toBe(400);
    expect(mocks.captcha).toHaveBeenCalledWith("invalid-token", action);
    expect(mocks.query).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
    expect(mocks.lookup).not.toHaveBeenCalled();
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it("does not require CAPTCHA for issue reports by authenticated staff", async () => {
    mocks.auth.mockResolvedValue({ user: { email: "staff@example.com" } });
    mocks.worker.mockResolvedValue({ workerId: "2", lookupFailed: false });
    const response = await issueReport(new Request("https://redihealth.org/api/report-issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "An internal report from staff." }),
    }));
    expect(response.status).toBe(201);
    expect(mocks.captcha).not.toHaveBeenCalled();
    expect(mocks.sendEmail).toHaveBeenCalledOnce();
  });

  it("does not exempt signed-in users who are not staff", async () => {
    mocks.auth.mockResolvedValue({ user: { email: "unknown@example.com" } });
    mocks.worker.mockResolvedValue({ workerId: null });
    const response = await issueReport(new Request("https://redihealth.org/api/report-issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Report without a staff membership." }),
    }));
    expect(response.status).toBe(400);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });
});
