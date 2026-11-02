import { createHash, randomBytes } from "crypto";

/** How long a portal link stays valid. Patients can request a fresh link from the sign-in page. */
export const PORTAL_LINK_TTL_DAYS = 90;

export const PORTAL_TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

/** Path of a patient's portal. The country is part of the link so the right database is read. */
export function portalPath(accessToken: string, country: string): string {
  return `/patient-portal/${accessToken}?c=${country.toLowerCase()}`;
}

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
