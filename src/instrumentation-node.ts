import type { Instrumentation } from "next";
import { reportError, installConsoleErrorReporting } from "@/lib/error-reporting";
import { safeErrorPath } from "@/lib/error-path";

/**
 * Node.js-only half of instrumentation.ts. The reporter uses the database, the mail API and
 * node:crypto, which do not exist in the Edge runtime, so instrumentation.ts only loads this file
 * inside a `process.env.NEXT_RUNTIME === "nodejs"` branch that the Edge bundle drops.
 */
export function registerNode() {
  installConsoleErrorReporting();
}

export const onRequestErrorNode: Instrumentation.onRequestError = async (error, request, context) => {
  try {
    const digest =
      typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : undefined;
    await reportError({
      source: "server",
      message: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      where: `${request.method} ${safeErrorPath(request.path)}`,
      details: { route: context.routePath, type: context.routeType, digest },
    });
  } catch {
    // Reporting must never turn one error into two.
  }
};
