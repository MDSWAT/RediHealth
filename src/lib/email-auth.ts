import { createHash, randomInt } from "crypto";
import { EncryptJWT, jwtDecrypt } from "jose";

const OTP_COOKIE = "redihealth_email_otp";
const OTP_LIFETIME_SECONDS = 10 * 60;

type EmailCodePayload = {
  email: string;
  code: string;
};

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return createHash("sha256").update(secret).digest();
}

export function createOneTimeCode() {
  return randomInt(100000, 1000000).toString();
}

export async function encryptEmailCode({ email, code }: EmailCodePayload) {
  return new EncryptJWT({ email, code })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${OTP_LIFETIME_SECONDS}s`)
    .encrypt(secretKey());
}

export async function decryptEmailCode(token: string) {
  const { payload } = await jwtDecrypt(token, secretKey());
  if (typeof payload.email !== "string" || typeof payload.code !== "string") {
    throw new Error("Invalid email code token.");
  }

  return { email: payload.email, code: payload.code };
}

export const emailAuthCookies = {
  otp: OTP_COOKIE,
  otpLifetime: OTP_LIFETIME_SECONDS,
};
