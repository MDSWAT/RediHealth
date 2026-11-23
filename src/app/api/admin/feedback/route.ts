import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity-log";
import { isSupportedCountry, type CountryCode } from "@/lib/countries";
import { hasControlDatabase } from "@/lib/database";
import { isSupportedLang } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { deletePlatformFeedback, listPlatformFeedback } from "@/lib/platform-feedback";
import { getClientIp } from "@/lib/rate-limit";
import { getUserWorkerContext, type UserWorkerContext } from "@/lib/worker-auth";

type AdminAccess =
  | { error: NextResponse }
  | { worker: UserWorkerContext; email: string };

async function requireAdminAccess(): Promise<AdminAccess> {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }
  const worker = await getUserWorkerContext(session.user.email);
  if (!worker.isAdmin && !worker.isSuperAdmin) {
    return { error: NextResponse.json({ error: "Administrator access is required." }, { status: 403 }) };
  }
  return { worker, email: session.user.email };
}

export async function GET(request: Request) {
  const access = await requireAdminAccess();
  if ("error" in access) return access.error;

  if (!hasControlDatabase()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const rawCountry = searchParams.get("country")?.trim().toUpperCase() || "";
  const rawLang = searchParams.get("lang")?.trim().toLowerCase() || "";
  const rawLimitParam = searchParams.get("limit");
  const parsedLimit = rawLimitParam === null || rawLimitParam.trim() === "" ? 250 : Number(rawLimitParam);
  const limit = Number.isFinite(parsedLimit) ? Math.min(500, Math.max(1, Math.trunc(parsedLimit))) : 250;

  // Country-level Administrators are restricted strictly to their own country; only Super Admins may query cross-country.
  const country: CountryCode | "" = access.worker.isSuperAdmin
    ? (isSupportedCountry(rawCountry) ? rawCountry : "")
    : access.worker.country;
  const lang: Lang | "" = isSupportedLang(rawLang) ? rawLang : "";

  try {
    const data = await listPlatformFeedback({ country, lang, limit });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load platform feedback", error);
    return NextResponse.json({ error: "Could not load platform feedback." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const access = await requireAdminAccess();
  if ("error" in access) return access.error;

  if (!hasControlDatabase()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  let id = searchParams.get("id")?.trim() || "";
  if (!id) {
    const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
    if (body && typeof body === "object" && !Array.isArray(body) && body.id != null) {
      id = String(body.id).trim();
    }
  }

  if (!id) {
    return NextResponse.json({ error: "Feedback ID is required." }, { status: 400 });
  }

  try {
    const removed = await deletePlatformFeedback(
      id,
      access.worker.isSuperAdmin ? undefined : { country: access.worker.country },
    );
    if (!removed) {
      return NextResponse.json({ error: "Feedback entry not found." }, { status: 404 });
    }

    await logActivity({
      country: access.worker.country,
      actorWorkerId: access.worker.workerId,
      actorName: access.worker.workerName,
      actorEmail: access.email,
      actorRole: access.worker.role,
      action: "feedback.deleted",
      entityType: "platform_feedback",
      entityId: id,
      details: { anonymized: true },
      ipAddress: getClientIp(request),
    }).catch(() => undefined);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete platform feedback", error);
    return NextResponse.json({ error: "Could not delete feedback entry." }, { status: 503 });
  }
}
