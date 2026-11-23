import { createHash, timingSafeEqual } from "crypto";
import { EncryptJWT, jwtDecrypt } from "jose";

export interface OtpEntry {
  otp: string;
  phone: string;
  expiresAt: number;
  consumed?: boolean;
}

type GlobalWithOtpStore = typeof globalThis & {
  redihealthPhoneOtpStore?: Map<string, OtpEntry>;
};

const globalWithOtpStore = globalThis as GlobalWithOtpStore;

export const otpStore = (globalWithOtpStore.redihealthPhoneOtpStore ??= new Map<string, OtpEntry>());

export const PHONE_OTP_COOKIE = "redihealth_phone_otp";
export const PHONE_OTP_TTL_SECONDS = 15 * 60;

const devFallbackSecret =
  process.env.NODE_ENV !== "production"
    ? "redihealth-local-dev-only-auth-secret-32chars"
    : undefined;

function secretKey(): Buffer | null {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || devFallbackSecret;
  if (!secret) return null;
  return createHash("sha256").update(secret).digest();
}

/** Encrypts a phone OTP payload into a JWE token for the HTTP-only cookie fallback across route chunks. */
export async function encryptPhoneOtp(
  entry: Pick<OtpEntry, "otp" | "phone" | "expiresAt">,
): Promise<string | null> {
  const key = secretKey();
  if (!key) return null;

  return new EncryptJWT({
    otp: entry.otp,
    phone: entry.phone,
    expiresAt: entry.expiresAt,
  })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${PHONE_OTP_TTL_SECONDS}s`)
    .encrypt(key);
}

/** Decrypts and validates a phone OTP cookie token, returning null when missing, expired, or invalid. */
export async function decryptPhoneOtp(token: string): Promise<OtpEntry | null> {
  const key = secretKey();
  if (!key || !token) return null;

  try {
    const { payload } = await jwtDecrypt(token, key);
    if (
      typeof payload.otp !== "string" ||
      typeof payload.phone !== "string" ||
      typeof payload.expiresAt !== "number"
    ) {
      return null;
    }
    return {
      otp: payload.otp,
      phone: payload.phone,
      expiresAt: payload.expiresAt,
    };
  } catch {
    return null;
  }
}

/** Reads a named cookie value from an HTTP Cookie header without throwing on malformed percent-encoding. */
export function readCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const prefix = `${name}=`;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(prefix)) continue;
    const raw = trimmed.slice(prefix.length);
    if (!raw) return null;
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

/** Constant-time equality check for OTP codes using equal-length UTF-8 buffers. */
export function isMatchingOtpCode(expected: string, candidate: string): boolean {
  const expectedBuf = Buffer.from(expected, "utf8");
  const candidateBuf = Buffer.from(candidate, "utf8");
  if (expectedBuf.length !== candidateBuf.length) {
    timingSafeEqual(expectedBuf, expectedBuf);
    return false;
  }
  return timingSafeEqual(expectedBuf, candidateBuf);
}

/**
 * Phone sign-in is a demonstration flow: no SMS provider is connected, so the code can only be
 * shown on screen. That must never happen on a deployed site, where it would let anyone open a
 * patient's portal. It requires an explicit opt-in flag in local development only.
 */
export function isPhoneOtpDemoEnabled(): boolean {
  return process.env.ENABLE_LOCAL_DEMO_OTP === "true" && process.env.NODE_ENV === "development";
}

/** Digits only, with an optional leading +. Rejects anything that could act as a SQL LIKE wildcard. */
export function normalizeOtpPhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const phone = value.trim().replace(/[\s().-]/g, "");
  return /^\+?\d{9,15}$/.test(phone) ? phone : null;
}
