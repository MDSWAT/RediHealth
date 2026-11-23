import { after, NextResponse } from "next/server";
import { isClientErrorNoise } from "@/lib/client-error-report";
import { safeErrorPath } from "@/lib/error-path";
import { reportError } from "@/lib/error-reporting";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { text } from "@/lib/text";

const KINDS = ["error", "unhandledrejection", "render"];

function sourcePosition(value: unknown): number | undefined {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

/** Receives errors from visitors' browsers (see lib/client-error-report.ts) and forwards them to the alert addresses. */
export async function POST(request: Request) {
  // Reports must come from the site's own pages: require a valid same-origin Origin or Sec-Fetch-Site: same-origin.
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (origin && origin !== requestOrigin) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }
  if (fetchSite && fetchSite !== "same-origin") {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }
  if (!origin && fetchSite !== "same-origin") {
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
      filename: safeErrorPath(text(body.filename)) || undefined,
      lineno: sourcePosition(body.lineno),
      colno: sourcePosition(body.colno),
      browser: (request.headers.get("user-agent") || "").slice(0, 300) || undefined,
    },
  };
  console.warn("Browser error reported", {
    kind, where: report.where, message,
    filename: report.details.filename, lineno: report.details.lineno, colno: report.details.colno,
  });

  // Answer immediately; the email goes out after the response.
  after(() => reportError(report));
  return new NextResponse(null, { status: 204 });
}
