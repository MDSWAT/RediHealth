import type { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { AUTH_BASE_PATH, isAuthActionPath } from "@/lib/auth-actions";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyRecaptcha } from "@/lib/security/recaptcha";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

// Unknown addresses under /api/auth (bots, stale links) get a 404 rather than an Auth.js
// "UnknownAction" error in the logs. Real sign-in, session and callback requests pass through.
function notFound() {
  return Response.json({ error: "Not found." }, { status: 404, headers: NO_STORE_HEADERS });
}

function parseAuthAction(pathname: string): { action: string; provider?: string } | null {
  if (!isAuthActionPath(pathname)) return null;
  const [action, provider] = pathname.slice(AUTH_BASE_PATH.length).split("/").filter(Boolean);
  return action ? { action, provider } : null;
}

/**
 * Auth.js client `signIn(..., { redirect: false })` always parses `new URL(data.url)` from the
 * JSON response. Returning `url` alongside `error` and `code` keeps client handling safe while
 * returning standard HTTP 429/400/503 status codes to direct callers.
 */
function authErrorResponse(
  request: NextRequest,
  status: number,
  error: string,
  code: string,
  extraHeaders?: Record<string, string>,
) {
  const errorUrl = new URL("/sign-in", request.nextUrl.origin);
  errorUrl.searchParams.set("error", error);
  errorUrl.searchParams.set("code", code);
  return Response.json(
    { error, code, url: errorUrl.toString() },
    { status, headers: { ...NO_STORE_HEADERS, ...extraHeaders } },
  );
}

async function readPostFields(request: NextRequest): Promise<Record<string, string>> {
  const cloned = request.clone();
  const contentType = cloned.headers.get("content-type")?.toLowerCase() ?? "";
  try {
    if (contentType.includes("application/json")) {
      const parsed = (await cloned.json()) as Record<string, unknown> | null;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      const out: Record<string, string> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === "string") out[key] = value;
      }
      return out;
    }
    const text = await cloned.text();
    const params = new URLSearchParams(text);
    const out: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  const parsed = parseAuthAction(request.nextUrl.pathname);
  if (!parsed) return notFound();

  if (parsed.action === "callback" || parsed.action === "signin") {
    const ipLimit = await checkRateLimit(`auth-get-${parsed.action}:ip:${getClientIp(request)}`, {
      limit: 20,
      windowMs: 5 * 60_000,
    });
    if (!ipLimit.allowed) {
      return authErrorResponse(
        request,
        429,
        "Too many sign-in attempts. Wait a moment and try again.",
        "rate_limited",
        { "Retry-After": String(ipLimit.retryAfterSeconds) },
      );
    }
  }

  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  const parsed = parseAuthAction(request.nextUrl.pathname);
  if (!parsed) return notFound();

  if (parsed.action === "signin" || parsed.action === "callback") {
    const ip = getClientIp(request);
    const limitConfig =
      parsed.action === "callback" && parsed.provider === "admin-password"
        ? { key: `auth-route-admin-password:ip:${ip}`, limit: 10, windowMs: 15 * 60_000 }
        : parsed.action === "callback" && parsed.provider === "email-code"
          ? { key: `auth-route-email-code:ip:${ip}`, limit: 15, windowMs: 5 * 60_000 }
          : parsed.action === "signin"
            ? { key: `auth-route-signin:ip:${ip}`, limit: 15, windowMs: 5 * 60_000 }
            : { key: `auth-route-callback:ip:${ip}`, limit: 20, windowMs: 5 * 60_000 };

    const ipLimit = await checkRateLimit(limitConfig.key, {
      limit: limitConfig.limit,
      windowMs: limitConfig.windowMs,
    });
    if (!ipLimit.allowed) {
      return authErrorResponse(
        request,
        429,
        "Too many sign-in attempts. Wait a moment and try again.",
        "rate_limited",
        { "Retry-After": String(ipLimit.retryAfterSeconds) },
      );
    }

    const fields = await readPostFields(request);
    if (fields.website && fields.website.trim().length > 0) {
      console.warn("Auth POST rejected: anti-spam honeypot field was populated.");
      return authErrorResponse(request, 400, "Sign-in request rejected.", "spam_detected");
    }

    // Credentials providers verify reCAPTCHA inside authorize() (reCAPTCHA v3 tokens are single-use).
    // OAuth sign-in (Google) has no authorize() hook, so verify it here before redirecting.
    if (parsed.action === "signin" && parsed.provider === "google") {
      const captchaError = await verifyRecaptcha(fields.captchaToken, "google_sign_in");
      if (captchaError) {
        const failure = (await captchaError.json().catch(() => null)) as
          | { error?: string; code?: string }
          | null;
        return authErrorResponse(
          request,
          captchaError.status,
          failure?.error || "Bot verification failed. Please try again.",
          failure?.code || "captcha_invalid",
        );
      }
    }
  }

  return handlers.POST(request);
}
