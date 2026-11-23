import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("@/lib/database", () => ({
  hasControlDatabase: () => true,
  getControlDatabase: () => ({ query }),
}));

beforeEach(() => {
  vi.resetModules();
  query.mockReset();
  vi.useFakeTimers();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("settings reads during database connection failures", () => {
  it("retries a connection timeout once and caches the successful read", async () => {
    query.mockRejectedValueOnce(new Error("Connection terminated due to connection timeout"))
      .mockResolvedValueOnce([[{ setting_value: "ops@example.org" }]]);
    const { getSetting } = await import("./settings");
    expect(await getSetting("alert_email")).toBe("ops@example.org");
    expect(await getSetting("alert_email")).toBe("ops@example.org");
    expect(query).toHaveBeenCalledTimes(2);
    expect(console.error).not.toHaveBeenCalled();
  });

  it("shares concurrent lookups for the same setting", async () => {
    query.mockResolvedValue([[{ setting_value: "ops@example.org" }]]);
    const { getSetting } = await import("./settings");
    expect(await Promise.all(Array.from({ length: 10 }, () => getSetting("alert_email"))))
      .toEqual(Array(10).fill("ops@example.org"));
    expect(query).toHaveBeenCalledTimes(1);
  });

  it("bounds retries during an outage, falls back to env, and recovers after cooldown", async () => {
    query.mockRejectedValue(new Error("Connection terminated due to connection timeout"));
    vi.stubEnv("OPERATIONAL_ALERT_EMAIL", "fallback@example.org");
    const { getAlertRecipients } = await import("./settings");
    expect(await getAlertRecipients()).toEqual({ emails: ["fallback@example.org"], source: "env" });
    expect(await getAlertRecipients()).toEqual({ emails: ["fallback@example.org"], source: "env" });
    expect(query).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(30_001);
    query.mockResolvedValue([[{ setting_value: "panel@example.org" }]]);
    expect(await getAlertRecipients()).toEqual({ emails: ["panel@example.org"], source: "panel" });
  });

  it("keeps the last known recipient when refreshing fails", async () => {
    query.mockResolvedValueOnce([[{ setting_value: "panel@example.org" }]]);
    const { getAlertRecipients } = await import("./settings");
    await getAlertRecipients();
    vi.advanceTimersByTime(30_001);
    query.mockRejectedValue(new Error("Connection terminated due to connection timeout"));
    expect(await getAlertRecipients()).toEqual({ emails: ["panel@example.org"], source: "panel" });
    expect(query).toHaveBeenCalledTimes(3);
  });

  it("uses a successful empty result instead of retaining stale recipients", async () => {
    query.mockResolvedValueOnce([[{ setting_value: "panel@example.org" }]])
      .mockResolvedValueOnce([[]]);
    const { getSetting } = await import("./settings");
    await getSetting("alert_email");
    vi.advanceTimersByTime(30_001);
    expect(await getSetting("alert_email")).toBeNull();
  });

  it("does not let an older read repopulate the cache after a successful write", async () => {
    let finishRead!: (rows: unknown) => void;
    query.mockImplementationOnce(() => new Promise((resolve) => { finishRead = resolve; }))
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ setting_value: "new@example.org" }]]);
    const { getSetting, setSetting } = await import("./settings");
    const olderRead = getSetting("alert_email");
    await setSetting("alert_email", "new@example.org", "admin");
    finishRead([[{ setting_value: "old@example.org" }]]);
    await olderRead;
    expect(await getSetting("alert_email")).toBe("new@example.org");
    expect(query).toHaveBeenCalledTimes(3);
  });

  it("does not retry SQL errors or writes", async () => {
    query.mockRejectedValue(Object.assign(new Error("permission denied"), { code: "42501" }));
    const { getSetting, setSetting } = await import("./settings");
    expect(await getSetting("alert_email")).toBeNull();
    expect(query).toHaveBeenCalledTimes(1);
    await expect(setSetting("alert_email", "ops@example.org", "admin")).rejects.toThrow("permission denied");
    expect(query).toHaveBeenCalledTimes(2);
  });
});
