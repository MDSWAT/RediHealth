import { randomBytes } from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  _resetFieldEncryptionWarningsForTest,
  decryptField,
  encryptField,
  isEncrypted,
  isEncryptionConfigured,
} from "@/lib/security/field-encryption";

const keyRo = randomBytes(32).toString("base64");
const keyIt = randomBytes(32).toString("base64");

describe("field encryption", () => {
  beforeEach(() => {
    vi.stubEnv("DATA_ENCRYPTION_KEY_RO", keyRo);
    vi.stubEnv("DATA_ENCRYPTION_KEY_IT", keyIt);
    vi.stubEnv("DATA_ENCRYPTION_KEY_AL", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    _resetFieldEncryptionWarningsForTest();
  });

  it("round-trips text and photos without leaving plaintext in the stored value", () => {
    const stored = encryptField("RO", "data:image/png;base64,AAAA — Ștefan");
    expect(isEncrypted(stored)).toBe(true);
    expect(stored).not.toContain("AAAA");
    expect(decryptField("RO", stored)).toBe("data:image/png;base64,AAAA — Ștefan");
  });

  it("uses a fresh nonce every time", () => {
    expect(encryptField("RO", "same")).not.toBe(encryptField("RO", "same"));
  });

  it("cannot be read with another country's key", () => {
    const stored = encryptField("RO", "secret");
    expect(() => decryptField("IT", stored)).toThrow();
  });

  it("detects tampering", () => {
    const stored = encryptField("RO", "secret") as string;
    const tampered = stored.slice(0, -2) + (stored.endsWith("AA") ? "BB" : "AA");
    expect(() => decryptField("RO", tampered)).toThrow();
  });

  it("passes plaintext stored before encryption was enabled straight through", () => {
    expect(decryptField("RO", "old plaintext")).toBe("old plaintext");
    expect(decryptField("RO", null)).toBeNull();
  });

  it("does not double-encrypt and stores empty values as null", () => {
    const stored = encryptField("RO", "secret");
    expect(encryptField("RO", stored)).toBe(stored);
    expect(encryptField("RO", "")).toBeNull();
    expect(encryptField("RO", null)).toBeNull();
  });

  it("stores plaintext when a country has no key, but refuses to read data it cannot decrypt", () => {
    expect(isEncryptionConfigured("AL")).toBe(false);
    expect(encryptField("AL", "hello")).toBe("hello");
    const stored = encryptField("RO", "secret");
    expect(() => decryptField("AL", stored)).toThrow(/DATA_ENCRYPTION_KEY_AL/);
  });

  it("rejects keys of the wrong size", () => {
    vi.stubEnv("DATA_ENCRYPTION_KEY_MD", "c2hvcnQ=");
    expect(() => encryptField("MD", "x")).toThrow(/32 bytes/);
  });

  it("fails closed when REQUIRE_FIELD_ENCRYPTION=true and a country's key is missing", () => {
    vi.stubEnv("REQUIRE_FIELD_ENCRYPTION", "true");
    expect(() => encryptField("AL", "sensitive-phi")).toThrow(/REQUIRE_FIELD_ENCRYPTION/);
    // Countries with a configured key continue to encrypt normally.
    expect(isEncrypted(encryptField("RO", "sensitive-phi"))).toBe(true);
  });

  it("emits a structured console.error warning once per country in production when key is missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("REQUIRE_FIELD_ENCRYPTION", "");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(encryptField("AL", "hello")).toBe("hello");
    expect(encryptField("AL", "hello again")).toBe("hello again");
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      "[security] field_encryption_missing_key",
      expect.objectContaining({ country: "AL", envVar: "DATA_ENCRYPTION_KEY_AL", fallback: "plaintext" }),
    );
  });
});
