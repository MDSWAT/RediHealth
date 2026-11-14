import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, createNonce } from "@/lib/security/csp";

const base = { nonce: "abc123", meetingOrigin: "https://meet.jit.si" };

describe("buildContentSecurityPolicy", () => {
  it("only allows nonce-tagged scripts and WebAssembly decoding in production", () => {
    const policy = buildContentSecurityPolicy({ ...base, isDevelopment: false });
    expect(policy).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic' 'wasm-unsafe-eval'");
    expect(policy).not.toContain("'unsafe-eval'");
    expect(policy).not.toMatch(/script-src[^;]*unsafe-inline/);
    expect(policy).toContain("worker-src 'self' blob:");
    expect(policy).toContain("manifest-src 'self'");
    expect(policy).toContain("upgrade-insecure-requests");
  });

  it("allows eval during development only", () => {
    const policy = buildContentSecurityPolicy({ ...base, isDevelopment: true });
    expect(policy).toContain("'unsafe-eval'");
    expect(policy).not.toContain("upgrade-insecure-requests");
  });

  it("locks down framing, plugins and base URI", () => {
    const policy = buildContentSecurityPolicy({ ...base, isDevelopment: false });
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("frame-src https://meet.jit.si");
  });

  it("allows CAPTCHA connections and frames without weakening script nonces", () => {
    const policy = buildContentSecurityPolicy({ ...base, isDevelopment: false });
    expect(policy).toContain("connect-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/");
    expect(policy).toContain("https://recaptcha.google.com/recaptcha/");
    expect(policy).toContain("'strict-dynamic'");
    expect(policy).not.toMatch(/script-src[^;]*unsafe-inline/);
  });
});

describe("createNonce", () => {
  it("returns a different value each time", () => {
    expect(createNonce()).not.toBe(createNonce());
  });
});
