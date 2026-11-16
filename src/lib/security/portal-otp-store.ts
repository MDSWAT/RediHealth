export interface OtpEntry {
  otp: string;
  phone: string;
  expiresAt: number;
}

export const otpStore = new Map<string, OtpEntry>();

/**
 * Phone sign-in is a demonstration flow: no SMS provider is connected, so the code can only be
 * shown on screen. That must never happen on a deployed site, where it would let anyone open a
 * patient's portal. It stays available in local development only.
 */
export function isPhoneOtpDemoEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

/** Digits only, with an optional leading +. Rejects anything that could act as a SQL LIKE wildcard. */
export function normalizeOtpPhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const phone = value.trim().replace(/[\s().-]/g, "");
  return /^\+?\d{9,15}$/.test(phone) ? phone : null;
}
