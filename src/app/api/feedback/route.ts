import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSupportedCountry } from "@/lib/countries";
import { defaultCountry, hasControlDatabase } from "@/lib/database";
import { countryFromHeaders } from "@/lib/medical-institutes";
import { insertPlatformFeedback, validateFeedbackPayload } from "@/lib/platform-feedback";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyRecaptcha } from "@/lib/security/recaptcha";
import { getUserWorkerContext } from "@/lib/worker-auth";

export async function POST(request: Request) {
  const ipAddress = getClientIp(request);
  // Rate-limit key is SHA-256 hashed in rate_limits; raw IP is never stored in platform_feedback.
  const rateLimit = await checkRateLimit(`platform-feedback:${ipAddress}`, {
    limit: 5,
    windowMs: 30 * 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many feedback submissions. Please try again later.", code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid request data.", code: "invalid_payload" }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request data.", code: "invalid_payload" }, { status: 400 });
  }

  const session = await auth();
  const staff = session?.user?.email ? await getUserWorkerContext(session.user.email) : null;
  if (!staff?.workerId || staff.lookupFailed) {
    const captchaError = await verifyRecaptcha(body.captchaToken, "platform_feedback");
    if (captchaError) return captchaError;
  }

  if (!hasControlDatabase()) {
    return NextResponse.json(
      { error: "Feedback storage is temporarily unavailable.", code: "unavailable" },
      { status: 503 },
    );
  }

  const detectedCountry = countryFromHeaders(request.headers)?.toUpperCase();
  const fallbackCountry = isSupportedCountry(detectedCountry) ? detectedCountry : defaultCountry();
  const validated = validateFeedbackPayload(body, fallbackCountry);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error, code: validated.code }, { status: 400 });
  }

  try {
    const id = await insertPlatformFeedback(validated.data);
    return NextResponse.json(
      {
        success: true,
        id,
        anonymized: true,
        redactions: validated.data.anonymized_redactions,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to store platform feedback", error);
    return NextResponse.json(
      { error: "Could not store feedback right now.", code: "storage_error" },
      { status: 503 },
    );
  }
}
