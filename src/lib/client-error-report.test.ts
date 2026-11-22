import { describe, expect, it } from "vitest";
import { isClientErrorNoise } from "@/lib/client-error-report";

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
