import type { Instrumentation } from "next";

export async function register() {
  // The reporter uses the database and the mail API, which only exist in the Node.js runtime.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { installConsoleErrorReporting } = await import("@/lib/error-reporting");
    installConsoleErrorReporting();
  }
}

/** Errors Next.js catches while rendering a page or running a route handler, action or the proxy. */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const [{ reportError }, { safeErrorPath }] = await Promise.all([
      import("@/lib/error-reporting"),
      import("@/lib/error-path"),
    ]);
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
