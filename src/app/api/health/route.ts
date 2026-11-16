import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { configuredCountries, getControlDatabase, getCountryDatabase, hasControlDatabase } from "@/lib/database";
import { isEmailConfigured } from "@/lib/email";
import { notifyOperationalIssue } from "@/lib/operational-alerts";
import { resolveLlmConfig } from "@/lib/llm";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isEncryptionConfigured } from "@/lib/security/field-encryption";

export const dynamic = "force-dynamic";

type Check = { status: string; latencyMs?: number };

// Monitors send `Authorization: Bearer <HEALTH_CHECK_TOKEN>` to get per-service details.
function hasMonitorAccess(request: Request) {
  const token = process.env.HEALTH_CHECK_TOKEN;
  if (!token) return false;

  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const expected = Buffer.from(token);
  const actual = Buffer.from(provided);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function checkDatabase(label: string, connect: () => { query: (sql: string, params?: unknown[]) => Promise<unknown> }): Promise<Check> {
  const start = Date.now();
  try {
    await connect().query("SELECT 1", []);
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (error) {
    console.error(`Health check: ${label} query failed`, error);
    return { status: "error" };
  }
}

export async function GET(request: Request) {
  // Each call queries every database, so anonymous callers are limited. Monitors with the token are not.
  if (!hasMonitorAccess(request)) {
    const rateLimit = await checkRateLimit(`health:${getClientIp(request)}`, { limit: 30, windowMs: 60_000 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }
  }

  const checks: Record<string, Check> = {};

  if (hasControlDatabase()) {
    checks.database = await checkDatabase("control database", getControlDatabase);
  } else {
    checks.database = { status: "not-configured" };
  }

  // Every country database is checked on its own, so one outage is visible without touching the others.
  const countries = configuredCountries();
  const countryChecks = await Promise.all(
    countries.map(async (country) => [country, await checkDatabase(`${country} database`, () => getCountryDatabase(country))] as const),
  );
  for (const [country, check] of countryChecks) {
    checks[`database:${country}`] = check;
  }
  if (countries.length === 0) {
    checks["database:countries"] = { status: "not-configured" };
  }

  // Without a country's key, medical history and photos are stored unencrypted.
  for (const country of countries) {
    checks[`encryption:${country}`] = { status: isEncryptionConfigured(country) ? "configured" : "not-configured" };
  }

  // Without a trusted proxy every visitor shares one rate-limit bucket, so one client can exhaust
  // the sign-in and form limits for everybody.
  if (process.env.NODE_ENV === "production") {
    const proxyTrusted = process.env.REDIHEALTH_TRUST_PROXY_HEADERS === "true" || process.env.VERCEL === "1";
    checks.clientIp = { status: proxyTrusted ? "configured" : "not-configured" };
  }

  checks.email = { status: isEmailConfigured() ? "configured" : "not-configured" };
  try {
    resolveLlmConfig();
    checks.aiAssistant = { status: "configured" };
  } catch {
    checks.aiAssistant = { status: "not-configured" };
  }

  const hasError = Object.values(checks).some((check) => check.status === "error");
  const hasMissingConfig = Object.values(checks).some((check) => check.status === "not-configured");
  const status = hasError ? "error" : hasMissingConfig ? "degraded" : "ok";
  const httpStatus = hasError ? 503 : 200;

  if (!hasMonitorAccess(request)) {
    return NextResponse.json({ status }, { status: httpStatus });
  }

  if (status !== "ok") {
    void notifyOperationalIssue({
      key: `health:${status}`,
      title: `Health endpoint reported ${status}`,
      summary: "One or more core services are failing or not configured.",
      source: "/api/health",
      severity: status === "error" ? "critical" : "warning",
      details: { status, checks: JSON.stringify(checks) },
      cooldownMs: 30 * 60_000,
    });
  }

  return NextResponse.json({ status, timestamp: new Date().toISOString(), checks }, { status: httpStatus });
}
