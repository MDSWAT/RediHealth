import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import type { CountryCode } from "@/lib/countries";

/**
 * Application-level encryption for sensitive patient fields, including intake documents and GPS.
 * Every country has its own key, so a leaked database dump or key for one country reveals nothing
 * about the others. Values are stored as `enc:v1:<iv>:<tag>:<ciphertext>` (AES-256-GCM, base64url);
 * anything without that prefix is treated as plaintext written before encryption was enabled.
 */

const PREFIX = "enc:v1:";
const warnedMissingKeyCountries = new Set<CountryCode>();

function keyFor(country: CountryCode): Buffer | null {
  const raw = process.env[`DATA_ENCRYPTION_KEY_${country}`]?.trim();
  if (!raw) return null;

  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(`DATA_ENCRYPTION_KEY_${country} must be 32 bytes, base64 encoded.`);
  }
  return key;
}

export function isEncryptionConfigured(country: CountryCode): boolean {
  return keyFor(country) !== null;
}

export function isEncrypted(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(PREFIX);
}

/**
 * Encrypts a value for storage.
 * Throws when REQUIRE_FIELD_ENCRYPTION=true and the country's key is missing;
 * otherwise logs a structured error once per country in production and falls back to plaintext.
 */
export function encryptField(country: CountryCode, value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (isEncrypted(value)) return value;

  const key = keyFor(country);
  if (!key) {
    if (process.env.REQUIRE_FIELD_ENCRYPTION === "true") {
      throw new Error(
        `DATA_ENCRYPTION_KEY_${country} is required when REQUIRE_FIELD_ENCRYPTION is enabled.`,
      );
    }
    if (process.env.NODE_ENV === "production" && !warnedMissingKeyCountries.has(country)) {
      warnedMissingKeyCountries.add(country);
      console.error("[security] field_encryption_missing_key", {
        country,
        envVar: `DATA_ENCRYPTION_KEY_${country}`,
        fallback: "plaintext",
      });
    }
    return value;
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [PREFIX + iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(":");
}

/** Reads a stored value, decrypting it when needed. Plaintext from before encryption passes through. */
export function decryptField(country: CountryCode, value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  if (!isEncrypted(value)) return value;

  const key = keyFor(country);
  if (!key) {
    throw new Error(`Encrypted data found but DATA_ENCRYPTION_KEY_${country} is not set.`);
  }

  const [iv, tag, encrypted] = value.slice(PREFIX.length).split(":");
  if (!iv || !tag || encrypted === undefined) {
    throw new Error("Malformed encrypted value.");
  }

  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString("utf8");
}

export function _resetFieldEncryptionWarningsForTest(): void {
  warnedMissingKeyCountries.clear();
}
