import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";
import {
  deleteInstitute,
  getInstituteForAdmin,
  setInstituteActive,
  updateInstitute,
} from "@/lib/data/medical-institutes";
import { validateInstituteInput } from "@/lib/medical-institutes";
import { getClientIp } from "@/lib/rate-limit";
import { requireSuperAdmin } from "@/lib/super-admin";

function parseId(raw: string) {
  return /^\d{1,19}$/.test(raw) ? raw : null;
}

export async function PATCH(
  request: Request,
  { params }: RouteContext<"/api/admin/medical-institutes/[id]">,
) {
  const access = await requireSuperAdmin();
  if ("error" in access) return access.error;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  try {
    let institute;
    let action: string;

    // `{ is_active }` alone is a quick show/hide toggle; anything else is a full edit.
    if (Object.keys(body).length === 1 && typeof body.is_active === "boolean") {
      institute = await setInstituteActive(id, body.is_active);
      action = body.is_active ? "medical_institute.shown" : "medical_institute.hidden";
    } else {
      const validation = validateInstituteInput(body);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      institute = await updateInstitute(id, validation.value);
      action = "medical_institute.updated";
    }

    if (!institute) return NextResponse.json({ error: "Not found." }, { status: 404 });

    await logActivity({
      actorWorkerId: access.worker.workerId,
      actorName: access.worker.workerName,
      actorEmail: access.email,
      actorRole: access.worker.role,
      action,
      entityType: "medical_institute",
      entityId: id,
      details: { name: institute.name, country: institute.country_code },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ institute });
  } catch (error) {
    console.error("Failed to update medical institute", error);
    return NextResponse.json({ error: "Could not save the institute." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteContext<"/api/admin/medical-institutes/[id]">,
) {
  const access = await requireSuperAdmin();
  if ("error" in access) return access.error;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  try {
    const existing = await getInstituteForAdmin(id);
    const outcome = await deleteInstitute(id);
    if (!outcome) return NextResponse.json({ error: "Not found." }, { status: 404 });

    await logActivity({
      actorWorkerId: access.worker.workerId,
      actorName: access.worker.workerName,
      actorEmail: access.email,
      actorRole: access.worker.role,
      action: outcome === "deleted" ? "medical_institute.deleted" : "medical_institute.hidden",
      entityType: "medical_institute",
      entityId: id,
      details: { name: existing?.name ?? null, country: existing?.country_code ?? null },
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ outcome });
  } catch (error) {
    console.error("Failed to delete medical institute", error);
    return NextResponse.json({ error: "Could not delete the institute." }, { status: 500 });
  }
}
