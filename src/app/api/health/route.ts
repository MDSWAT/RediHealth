import { NextResponse } from "next/server";
import { getDatabase, hasDatabaseConnectionConfig } from "@/lib/database";
import { isEmailConfigured } from "@/lib/email";
import { notifyOperationalIssue } from "@/lib/operational-alerts";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, { status: string; latencyMs?: number; error?: string }> = {};

  // Database connectivity and pool saturation check
  if (hasDatabaseConnectionConfig()) {
    const start = Date.now();
    try {
      const db = getDatabase();
      await db.query("SELECT 1", []);
      checks.database = { status: "ok", latencyMs: Date.now() - start };
    } catch (error) {
      checks.database = {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown database error",
      };
    }
  } else {
    checks.database = { status: "not-configured" };
  }

  // Email service configuration check
  checks.email = {
    status: isEmailConfigured() ? "configured" : "not-configured",
  };

  // AI assistant configuration check
  checks.aiAssistant = {
    status: process.env.LLMSRELAY_API_KEY || process.env.ANTHROPIC_API_KEY ? "configured" : "not-configured",
  };

  const hasError = Object.values(checks).some((check) => check.status === "error");
  const hasMissingConfig = Object.values(checks).some((check) => check.status === "not-configured");
  const status = hasError ? "error" : hasMissingConfig ? "degraded" : "ok";

  if (status !== "ok") {
    void notifyOperationalIssue({
      key: `health:${status}`,
      title: `Health endpoint reported ${status}`,
      summary: "One or more core services are failing or not configured.",
      source: "/api/health",
      severity: status === "error" ? "critical" : "warning",
      details: {
        status,
        checks: JSON.stringify(checks),
      },
      cooldownMs: 30 * 60_000,
    });
  }

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: hasError ? 503 : 200 },
  );
}
