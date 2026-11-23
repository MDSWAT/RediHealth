import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";
import { validateCampaignLink, type ValidCampaignLink } from "@/lib/campaign-links";
import { hasControlDatabase } from "@/lib/database";
import { deleteCampaignLink, listCampaignLinks, saveCampaignLinks } from "@/lib/data/campaign-links";
import { getClientIp } from "@/lib/rate-limit";
import { requireSuperAdmin } from "@/lib/super-admin";

/** Saved ad links for the Statistics page (super admins only; stored in global control DB). Every response returns the full list. */
const MAX_LINKS_PER_SAVE = 30;

async function requireCampaignLinkAccess() {
  const access = await requireSuperAdmin();
  if ("error" in access) return access;
  if (!hasControlDatabase()) {
    return { error: NextResponse.json({ error: "Database is not configured." }, { status: 503 }) };
  }
  return access;
}

type Access = Exclude<Awaited<ReturnType<typeof requireCampaignLinkAccess>>, { error: unknown }>;

function log(request: Request, access: Access, action: string, entityId: string | null, details: Record<string, unknown>) {
  return logActivity({
    country: access.worker.country,
    actorWorkerId: access.worker.workerId,
    actorName: access.worker.workerName,
    actorEmail: access.email,
    actorRole: access.worker.role,
    action,
    entityType: "campaign_link",
    entityId,
    details,
    ipAddress: getClientIp(request),
  }).catch(() => undefined);
}

async function listResponse(extra: Record<string, unknown> = {}) {
  return NextResponse.json({ links: await listCampaignLinks(), ...extra });
}

function idFrom(request: Request, body?: { id?: unknown } | null): number | null {
  const raw = new URL(request.url).searchParams.get("id") ?? (body?.id != null ? String(body.id) : "");
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export async function GET() {
  const access = await requireCampaignLinkAccess();
  if ("error" in access) return access.error;
  try {
    return await listResponse();
  } catch (error) {
    console.error("Failed to load campaign links", error);
    return NextResponse.json({ error: "Could not load the saved links." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const access = await requireCampaignLinkAccess();
  if ("error" in access) return access.error;

  const parsed = await request.json().catch(() => null);
  const body = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as { links?: unknown }) : null;
  const input = Array.isArray(body?.links) ? body.links : [];
  if (input.length === 0 || input.length > MAX_LINKS_PER_SAVE) {
    return NextResponse.json({ error: `Send between 1 and ${MAX_LINKS_PER_SAVE} links.` }, { status: 400 });
  }
  const links = input.map(validateCampaignLink);
  if (links.some((link) => link === null)) {
    return NextResponse.json({ error: "One of the links is not valid." }, { status: 400 });
  }

  try {
    const added = await saveCampaignLinks(links as ValidCampaignLink[], access.email);
    await log(request, access, "campaign_links.saved", null, { count: added, campaign: (links[0] as ValidCampaignLink).campaign });
    return await listResponse({ added });
  } catch (error) {
    console.error("Failed to save campaign links", error);
    return NextResponse.json({ error: "Could not save the links." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const access = await requireCampaignLinkAccess();
  if ("error" in access) return access.error;

  const parsed = await request.json().catch(() => null);
  const body = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as { id?: unknown }) : null;
  const id = idFrom(request, body);
  if (!id) return NextResponse.json({ error: "Link ID is required." }, { status: 400 });

  try {
    const removed = await deleteCampaignLink(id);
    if (!removed) return NextResponse.json({ error: "Link not found." }, { status: 404 });
    await log(request, access, "campaign_links.deleted", String(id), {});
    return await listResponse();
  } catch (error) {
    console.error("Failed to delete campaign link", error);
    return NextResponse.json({ error: "Could not delete the link." }, { status: 503 });
  }
}
