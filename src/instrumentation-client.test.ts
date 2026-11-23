import { afterEach, beforeEach, expect, it, vi } from "vitest";

const { reloadForNewVersion, reloadForTruncatedChunk, reportClientError } = vi.hoisted(() => ({
  reloadForNewVersion: vi.fn(), reloadForTruncatedChunk: vi.fn(), reportClientError: vi.fn(),
}));
vi.mock("@/lib/chunk-reload", () => ({ reloadForNewVersion, reloadForTruncatedChunk }));
vi.mock("@/lib/client-error-report", () => ({ reportClientError }));
const listeners = new Map<string, (event: unknown) => void>();

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  listeners.clear();
  reloadForNewVersion.mockReturnValue(false);
  reloadForTruncatedChunk.mockResolvedValue(false);
  vi.stubGlobal("window", { addEventListener: (name: string, listener: (event: unknown) => void) => listeners.set(name, listener) });
});
afterEach(() => vi.unstubAllGlobals());

it("preserves source coordinates when a native parse error has no Error object", async () => {
  await import("./instrumentation-client");
  const event = { error: null, message: "Uncaught SyntaxError: Unexpected end of input", filename: "https://redihealth.example/_next/static/chunks/app.js", lineno: 1, colno: 50 };
  listeners.get("error")!(event);
  await Promise.resolve();
  expect(reloadForTruncatedChunk).toHaveBeenCalledWith(event.message, event.filename);
  expect(reportClientError).toHaveBeenCalledWith(event.message, "error", { filename: event.filename, lineno: 1, colno: 50 });
});

it("finishes recovery without emailing a transient script failure", async () => {
  reloadForTruncatedChunk.mockResolvedValue(true);
  await import("./instrumentation-client");
  listeners.get("error")!({ error: new SyntaxError("Unexpected end of input"), filename: "/_next/static/chunks/app.js" });
  await Promise.resolve();
  expect(reportClientError).not.toHaveBeenCalled();
});

it("retains existing missing-chunk recovery", async () => {
  reloadForNewVersion.mockReturnValue(true);
  await import("./instrumentation-client");
  listeners.get("error")!({ error: new Error("Failed to load chunk app.js") });
  expect(reloadForTruncatedChunk).not.toHaveBeenCalled();
  expect(reportClientError).not.toHaveBeenCalled();
});
