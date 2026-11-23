import { afterEach, expect, it, vi } from "vitest";

const { reportError } = vi.hoisted(() => ({ reportError: vi.fn() }));
vi.mock("@/lib/error-reporting", () => ({ reportError }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: async () => ({ allowed: true }), getClientIp: () => "unknown" }));
vi.mock("next/server", async (original) => ({
  ...await original<typeof import("next/server")>(), after: (callback: () => unknown) => callback(),
}));
import { POST } from "./route";

afterEach(() => { vi.restoreAllMocks(); reportError.mockClear(); });

it("logs and forwards sanitized script coordinates for stackless parse errors", async () => {
  const logged = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  const response = await POST(new Request("https://redihealth.example/api/client-errors", {
    method: "POST",
    body: JSON.stringify({ kind: "error", message: "SyntaxError: Unexpected end of input", path: "/ro", filename: "/_next/static/chunks/app.js?secret=hidden", lineno: 1, colno: 427 }),
  }));
  expect(response.status).toBe(204);
  expect(reportError).toHaveBeenCalledWith(expect.objectContaining({
    details: expect.objectContaining({ filename: "/_next/static/chunks/app.js", lineno: 1, colno: 427 }),
  }));
  expect(logged).toHaveBeenCalledWith("Browser error reported", expect.objectContaining({ filename: "/_next/static/chunks/app.js", lineno: 1 }));
});

it("drops invalid coordinates and still accepts older clients", async () => {
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  await POST(new Request("https://redihealth.example/api/client-errors", {
    method: "POST", body: JSON.stringify({ message: "SyntaxError: Unexpected end of input", lineno: -1, colno: "427" }),
  }));
  expect(reportError).toHaveBeenCalledWith(expect.objectContaining({
    details: expect.objectContaining({ filename: undefined, lineno: undefined, colno: undefined }),
  }));
});
