import { createHash, timingSafeEqual } from "crypto";

type AdminCredentials = {
  email: string;
  password: string;
};

function getConfiguredAdminCredentials(): AdminCredentials | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !password) return null;
  return { email, password };
}

/** Constant-time equality check via SHA-256 digests so neither value nor length leaks via timing. */
function timingSafeStringEqual(expected: string, candidate: string): boolean {
  const expectedDigest = createHash("sha256").update(expected, "utf8").digest();
  const candidateDigest = createHash("sha256").update(candidate, "utf8").digest();
  return timingSafeEqual(expectedDigest, candidateDigest);
}

export function isAdminPasswordConfigured(): boolean {
  return getConfiguredAdminCredentials() !== null;
}

export function isConfiguredAdminEmail(email: string | null | undefined): boolean {
  const configured = getConfiguredAdminCredentials();
  const normalized = email?.trim().toLowerCase() ?? "";
  if (!configured || !normalized) return false;
  return timingSafeStringEqual(configured.email, normalized);
}

export function verifyAdminPasswordCredentials(email: string, password: string): boolean {
  const configured = getConfiguredAdminCredentials();
  const normalizedEmail = email.trim().toLowerCase();
  if (!configured || !normalizedEmail || !password) return false;

  // Evaluate both comparisons without short-circuiting so email validity is not leaked by timing.
  const emailMatches = timingSafeStringEqual(configured.email, normalizedEmail);
  const passwordMatches = timingSafeStringEqual(configured.password, password);
  return emailMatches && passwordMatches;
}
