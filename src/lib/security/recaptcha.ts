import { NextResponse } from "next/server";

export type CaptchaAction =
  | "help_request"
  | "email_code"
  | "verify_code"
  | "portal_link"
  | "issue_report"
  | "health_assistant"
  | "patient_portal";

type Verification = {
  success?: boolean;
  score?: number;
  action?: string;
  hostname?: string;
  challenge_ts?: string;
};

export async function verifyRecaptcha(
  token: unknown,
  action: CaptchaAction,
): Promise<NextResponse | null> {
  if (process.env.RECAPTCHA_ENABLED !== "true") return null;

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const hostnames = (process.env.RECAPTCHA_ALLOWED_HOSTNAMES || "")
    .split(",").map((host) => host.trim().toLowerCase()).filter(Boolean);

  if (!secret || hostnames.length === 0) {
    console.error("reCAPTCHA is not configured: secret key and allowed hostnames are required.");
    return NextResponse.json(
      { error: "Bot protection is not configured. Please contact support.", code: "captcha_unavailable" },
      { status: 503 },
    );
  }

  if (typeof token !== "string" || !token.trim() || token.length > 4096) {
    return NextResponse.json(
      { error: "Please complete the bot verification and try again.", code: "captcha_invalid" },
      { status: 400 },
    );
  }

  let result: Verification;
  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Verification service returned ${response.status}`);
    result = await response.json() as Verification;
    if (!result || typeof result !== "object") throw new Error("Invalid verification response");
  } catch (error) {
    console.error("reCAPTCHA verification service unavailable.", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Bot verification is temporarily unavailable. Please try again.", code: "captcha_unavailable" },
      { status: 503 },
    );
  }

  const timestamp = typeof result.challenge_ts === "string" ? Date.parse(result.challenge_ts) : NaN;
  const age = Date.now() - timestamp;
  if (
    result.success !== true ||
    typeof result.score !== "number" || !Number.isFinite(result.score) || result.score < 0.5 || result.score > 1 ||
    result.action !== action ||
    typeof result.hostname !== "string" || !hostnames.includes(result.hostname.toLowerCase()) ||
    !Number.isFinite(timestamp) || age < -30_000 || age > 120_000
  ) {
    console.warn("reCAPTCHA rejected a submission.", { action });
    return NextResponse.json(
      { error: "Bot verification failed. Please try again.", code: "captcha_invalid" },
      { status: 400 },
    );
  }

  return null;
}
