import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";
import { createInstitute, listInstitutesForAdmin } from "@/lib/data/medical-institutes";
import {
  isInstituteCategory,
  validateInstituteInput,
} from "@/lib/medical-institutes";
import { getClientIp } from "@/lib/rate-limit";
import { requireSuperAdmin } from "@/lib/super-admin";

export async function GET(request: Request) {
  const access = await requireSuperAdmin();
  if ("error" in access) return access.error;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  try {
    const result = await listInstitutesForAdmin({
      search: (searchParams.get("search") || "").slice(0, 100),
      // Super admins only see the directory of the country they are working in.
      country: access.worker.country,
      category: isInstituteCategory(category) ? category : null,
      status: status === "active" || status === "hidden" ? status : "all",
      page: Number(searchParams.get("page") || 1) || 1,
      pageSize: Number(searchParams.get("pageSize") || 50) || 50,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to list medical institutes", error);
    return NextResponse.json(
      { error: "Could not load medical institutes. Ensure migration 007 is applied." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const access = await requireSuperAdmin();
  if ("error" in access) return access.error;

  const body = await request.json().catch(() => null);
  const validation = validateInstituteInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  if (validation.value.country_code !== access.worker.country) {
    return NextResponse.json({ error: "You can only manage institutes of your own country." }, { status: 403 });
  }

  try {
    const institute = await createInstitute(validation.value);
    await logActivity({
      country: access.worker.country,
      actorWorkerId: access.worker.workerId,
      actorName: access.worker.workerName,
      actorEmail: access.email,
      actorRole: access.worker.role,
      action: "medical_institute.created",
      entityType: "medical_institute",
      entityId: institute?.id ?? null,
      details: { name: validation.value.name, country: validation.value.country_code },
      ipAddress: getClientIp(request),
    });
    return NextResponse.json({ institute }, { status: 201 });
  } catch (error) {
    console.error("Failed to create medical institute", error);
    return NextResponse.json({ error: "Could not save the institute." }, { status: 500 });
  }
}
