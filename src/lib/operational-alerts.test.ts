import { beforeEach, expect, it, vi } from "vitest";

const { getAlertRecipients, checkRateLimit, sendEmail, renderBrandEmail } = vi.hoisted(() => ({
  getAlertRecipients: vi.fn().mockResolvedValue({ emails: ["ops@example.test"] }),
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
  sendEmail: vi.fn().mockResolvedValue(undefined),
  renderBrandEmail: vi.fn().mockReturnValue("<html>critical</html>"),
}));
vi.mock("@/lib/settings", () => ({ getAlertRecipients }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit }));
vi.mock("@/lib/email", () => ({ isEmailConfigured: () => true, sendEmail, renderBrandEmail }));
import { notifyOperationalIssue } from "./operational-alerts";

beforeEach(() => vi.clearAllMocks());

it.each(["warning", "info", undefined] as const)("does not email %s alerts or query recipient settings", async (severity) => {
  expect(await notifyOperationalIssue({ key: "test", title: "Notice", summary: "Notice", source: "test", severity })).toBe(false);
  expect(sendEmail).not.toHaveBeenCalled();
  expect(getAlertRecipients).not.toHaveBeenCalled();
  expect(checkRateLimit).not.toHaveBeenCalled();
});

it("continues to email critical service failures with the existing rate limits", async () => {
  expect(await notifyOperationalIssue({
    key: "database-outage", title: "Database unavailable", summary: "Connection failed", source: "/api/health", severity: "critical",
    hourlyCap: { key: "errors", limit: 40 },
  })).toBe(true);
  expect(checkRateLimit).toHaveBeenCalledTimes(2);
  expect(renderBrandEmail).toHaveBeenCalledWith(expect.objectContaining({ badgeText: "Critical alert" }));
  expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ subject: "[RediHealth critical] Database unavailable" }));
});
