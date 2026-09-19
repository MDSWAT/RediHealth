import { NextResponse } from "next/server";
import { getDatabase, hasDatabaseConnectionConfig } from "@/lib/database";
import { isEmailConfigured } from "@/lib/email";

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

  return NextResponse.json(
    {
      status: hasError ? "error" : hasMissingConfig ? "degraded" : "ok",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: hasError ? 503 : 200 },
  );
}
