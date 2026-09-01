import { createHash, randomInt } from "crypto";
import { EncryptJWT, SignJWT, jwtDecrypt } from "jose";

const OTP_COOKIE = "redihealth_email_otp";
const SESSION_COOKIE = "redihealth_email_session";
const OTP_LIFETIME_SECONDS = 10 * 60;
const SESSION_LIFETIME_SECONDS = 7 * 24 * 60 * 60;

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

export async function createEmailSession(email: string) {
  return new SignJWT({ email, method: "email-code" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_LIFETIME_SECONDS}s`)
    .sign(secretKey());
}

export const emailAuthCookies = {
  otp: OTP_COOKIE,
  session: SESSION_COOKIE,
  otpLifetime: OTP_LIFETIME_SECONDS,
  sessionLifetime: SESSION_LIFETIME_SECONDS,
};
