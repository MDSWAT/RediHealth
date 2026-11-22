import { after, NextResponse } from "next/server";
import { isClientErrorNoise } from "@/lib/client-error-report";
import { safeErrorPath } from "@/lib/error-path";
import { reportError } from "@/lib/error-reporting";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { text } from "@/lib/text";

const KINDS = ["error", "unhandledrejection", "render"];

/** Receives errors from visitors' browsers (see lib/client-error-report.ts) and forwards them to the alert addresses. */
export async function POST(request: Request) {
  // Reports come from the site's own pages only.
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const rateLimit = await checkRateLimit(`client-errors:${getClientIp(request)}`, { limit: 20, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many reports." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid report." }, { status: 400 });
  }

  const message = text(body.message).slice(0, 1000);
  const kind = KINDS.includes(String(body.kind)) ? String(body.kind) : "error";
  if (!message) {
    return NextResponse.json({ error: "Invalid report." }, { status: 400 });
  }

  // Pages loaded before a filter was added still send these; drop them here too.
  if (isClientErrorNoise(message, text(body.stack))) {
    return new NextResponse(null, { status: 204 });
  }

  const report = {
    source: "browser" as const,
    message,
    stack: text(body.stack).slice(0, 4000) || undefined,
    where: safeErrorPath(text(body.path)) || undefined,
    details: {
      kind,
      digest: text(body.digest).slice(0, 64) || undefined,
      browser: (request.headers.get("user-agent") || "").slice(0, 300) || undefined,
    },
  };
  console.warn("Browser error reported", { kind, where: report.where, message });

  // Answer immediately; the email goes out after the response.
  after(() => reportError(report));
  return new NextResponse(null, { status: 204 });
}
