import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { NextResponse } from "next/server";

export const AI_DEVICE_COOKIE = "redihealth_ai_device";
export const AI_DEVICE_HEADER = "x-device-id";
export const AI_DEVICE_COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

const DEVICE_HEX_ID_PATTERN = /^[a-f0-9]{32}$/;
const CLIENT_DEVICE_ID_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

// Ephemeral fallback when AUTH_SECRET is absent (dev/tests); avoids hardcoded secrets while remaining stable per process.
const EPHEMERAL_DEV_SECRET = randomBytes(32).toString("hex");

function signingSecret(): string {
  return process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim() || EPHEMERAL_DEV_SECRET;
}

function signDeviceId(id: string): string {
  const signature = createHmac("sha256", signingSecret()).update(`ai-device:${id}`).digest("base64url");
  return `${id}.${signature}`;
}

export function verifySignedDeviceCookie(rawValue: string | undefined): string | null {
  if (!rawValue) return null;
  const dot = rawValue.indexOf(".");
  if (dot <= 0) return null;
  const id = rawValue.slice(0, dot);
  const signature = rawValue.slice(dot + 1);
  if (!DEVICE_HEX_ID_PATTERN.test(id) || !signature) return null;

  const expected = createHmac("sha256", signingSecret()).update(`ai-device:${id}`).digest();
  let actual: Buffer;
  try {
    actual = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (actual.length !== expected.length) return null;
  return timingSafeEqual(actual, expected) ? id : null;
}

function readCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (key !== name) continue;
    const val = trimmed.slice(eq + 1).trim();
    try {
      return decodeURIComponent(val);
    } catch {
      return val;
    }
  }
  return undefined;
}

export type AiDeviceIdentity = {
  primaryDeviceId: string;
  deviceKeys: string[];
  signedCookieValue: string;
  shouldSetCookie: boolean;
};

/**
 * Resolves a tamper-resistant server device identity for AI assistant rate limiting and abuse lockouts.
 * Combines an HMAC-signed first-party HttpOnly cookie with an optional client storage device ID header.
 */
export function resolveAiDeviceIdentity(request: Request): AiDeviceIdentity {
  const rawCookie = readCookieValue(request.headers.get("cookie"), AI_DEVICE_COOKIE);
  const verifiedCookieId = verifySignedDeviceCookie(rawCookie);

  const primaryDeviceId = verifiedCookieId ?? randomBytes(16).toString("hex");
  const shouldSetCookie = verifiedCookieId === null;
  const signedCookieValue = shouldSetCookie ? signDeviceId(primaryDeviceId) : (rawCookie as string);

  const rawClientId = request.headers.get(AI_DEVICE_HEADER)?.trim();
  const validClientId = rawClientId && CLIENT_DEVICE_ID_PATTERN.test(rawClientId) ? rawClientId : null;

  const deviceKeys = validClientId
    ? Array.from(new Set([primaryDeviceId, `client:${validClientId}`]))
    : [primaryDeviceId];

  return {
    primaryDeviceId,
    deviceKeys,
    signedCookieValue,
    shouldSetCookie,
  };
}

export function attachAiDeviceCookie(response: NextResponse, identity: AiDeviceIdentity): NextResponse {
  if (!identity.shouldSetCookie) return response;
  response.cookies.set(AI_DEVICE_COOKIE, identity.signedCookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AI_DEVICE_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
