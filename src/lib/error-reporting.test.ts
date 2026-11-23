import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { notifyOperationalIssue, after } = vi.hoisted(() => ({
  notifyOperationalIssue: vi.fn().mockResolvedValue(true),
  after: vi.fn(),
}));
vi.mock("@/lib/operational-alerts", () => ({ notifyOperationalIssue }));
vi.mock("next/server", () => ({ after }));

const warning = "(node:8) ExperimentalWarning: vm.USE_MAIN_CONTEXT_DEFAULT_LOADER is an experimental feature and might change at any time\n(Use `node --trace-warnings ...` to show where the warning was created)";

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv("ERROR_ALERTS_ENABLED", "true");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  delete (globalThis as { redihealthConsoleErrorReporting?: boolean }).redihealthConsoleErrorReporting;
});

describe("server log alert classification", () => {
  it("skips the known Node VM warning without sending an alert", async () => {
    const { reportError } = await import("./error-reporting");
    expect(await reportError({ source: "server-log", message: warning })).toBe(false);
    expect(notifyOperationalIssue).not.toHaveBeenCalled();
  });

  it("leaves the warning in logs without scheduling an alert lookup", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { installConsoleErrorReporting } = await import("./error-reporting");
    installConsoleErrorReporting();
    const wrapped = console.error;
    try {
      wrapped(warning);
      expect(logged).toHaveBeenCalledWith(warning);
      expect(after).not.toHaveBeenCalled();
    } finally {
      console.error = logged;
    }
  });

  it.each([
    "Failed to read setting alert_email Error: Connection terminated due to connection timeout",
    "ExperimentalWarning: a different experimental API",
    `${warning}\nError: real failure`,
  ])("still alerts on other server logs: %s", async (message) => {
    const { reportError } = await import("./error-reporting");
    expect(await reportError({ source: "server-log", message })).toBe(true);
    expect(notifyOperationalIssue).toHaveBeenCalledWith(expect.objectContaining({ severity: "critical" }));
  });

  it("does not filter request exceptions that contain the warning text", async () => {
    const { reportError } = await import("./error-reporting");
    expect(await reportError({ source: "server", message: warning })).toBe(true);
  });
});
