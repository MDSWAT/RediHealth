import { createHash, randomInt, randomUUID, timingSafeEqual } from "crypto";
import { EncryptJWT, jwtDecrypt } from "jose";

const OTP_COOKIE = "redihealth_email_otp";
const OTP_LIFETIME_SECONDS = 10 * 60;

type EmailCodePayload = {
  email: string;
  code: string;
};

const devFallbackSecret =
  process.env.NODE_ENV !== "production"
    ? "redihealth-local-dev-only-auth-secret-32chars"
    : undefined;

function secretKey() {
  const secret =
    process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || devFallbackSecret;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return createHash("sha256").update(secret).digest();
}

export function createOneTimeCode() {
  return randomInt(100000, 1000000).toString();
}

/** Constant-time equality check on equal-length UTF-8 buffers to prevent timing side channels. */
export function isMatchingOneTimeCode(expected: string, candidate: string): boolean {
  const expectedBuf = Buffer.from(expected, "utf8");
  const candidateBuf = Buffer.from(candidate, "utf8");
  if (expectedBuf.length !== candidateBuf.length) {
    timingSafeEqual(expectedBuf, expectedBuf);
    return false;
  }
  return timingSafeEqual(expectedBuf, candidateBuf);
}

export async function encryptEmailCode({ email, code }: EmailCodePayload) {
  return new EncryptJWT({ email, code })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime(`${OTP_LIFETIME_SECONDS}s`)
    .encrypt(secretKey());
}

export async function decryptEmailCode(token: string) {
  const { payload } = await jwtDecrypt(token, secretKey());
  if (
    typeof payload.email !== "string" ||
    typeof payload.code !== "string" ||
    typeof payload.jti !== "string" ||
    !payload.jti
  ) {
    throw new Error("Invalid email code token.");
  }

  return { email: payload.email, code: payload.code, jti: payload.jti };
}

export const emailAuthCookies = {
  otp: OTP_COOKIE,
  otpLifetime: OTP_LIFETIME_SECONDS,
};
