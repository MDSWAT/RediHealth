import { afterEach, describe, expect, it, vi } from "vitest";
import { isClientErrorNoise, reportClientError } from "@/lib/client-error-report";

afterEach(() => vi.unstubAllGlobals());

describe("native script parse error reports", () => {
  it("preserves source coordinates when there is no error stack and removes URL secrets", async () => {
    const sendBeacon = vi.fn().mockReturnValue(true);
    vi.stubGlobal("window", { location: { pathname: "/ro" } });
    vi.stubGlobal("navigator", { onLine: true, sendBeacon });
    reportClientError("SyntaxError: Unexpected end of input", "error", {
      filename: "https://redihealth.example/_next/static/chunks/app.js?secret=hidden#private", lineno: 1, colno: 427,
    });
    const body = JSON.parse(await (sendBeacon.mock.calls[0][1] as Blob).text());
    expect(body).toMatchObject({ filename: "/_next/static/chunks/app.js", lineno: 1, colno: 427, path: "/ro" });
    expect(JSON.stringify(body)).not.toContain("hidden");
  });

  it("filters extension parse errors identified only by the source filename", () => {
    const sendBeacon = vi.fn().mockReturnValue(true);
    vi.stubGlobal("window", { location: { pathname: "/ro" } });
    vi.stubGlobal("navigator", { onLine: true, sendBeacon });
    reportClientError("SyntaxError: Unexpected end of input", "error", { filename: "chrome-extension://abc/injected.js" });
    expect(sendBeacon).not.toHaveBeenCalled();
  });
});

describe("isClientErrorNoise", () => {
  it("ignores errors from Android in-app browser bridges", () => {
    expect(isClientErrorNoise("Error: Error invoking postMessage: Java object is gone")).toBe(true);
    expect(isClientErrorNoise("Error: Java bridge method invocation error")).toBe(true);
  });

  it("ignores extension errors found only in the stack", () => {
    expect(isClientErrorNoise("TypeError: x is undefined", "at chrome-extension://abc/content.js:1:1")).toBe(true);
  });

  it("keeps real website errors", () => {
    expect(isClientErrorNoise("TypeError: Cannot read properties of undefined (reading 'map')")).toBe(false);
  });
});
