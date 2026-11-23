import type { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { isAuthActionPath } from "@/lib/auth-actions";

// Unknown addresses under /api/auth (bots, stale links) get a 404 rather than an Auth.js
// "UnknownAction" error in the logs. Real sign-in, session and callback requests pass through.
function notFound() {
  return Response.json({ error: "Not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: NextRequest) {
  return isAuthActionPath(request.nextUrl.pathname) ? handlers.GET(request) : notFound();
}

export async function POST(request: NextRequest) {
  return isAuthActionPath(request.nextUrl.pathname) ? handlers.POST(request) : notFound();
}
