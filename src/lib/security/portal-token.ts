import { createHash, randomBytes } from "crypto";

/**
 * Hashes a raw patient portal access token using SHA-256.
 * Only the hash is stored in the database; the raw token is only used in emails/links.
 */
export function hashPortalToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Generates a cryptographically secure, URL-safe portal access token.
 */
export function generatePortalToken(): string {
  return randomBytes(24).toString("base64url");
}
