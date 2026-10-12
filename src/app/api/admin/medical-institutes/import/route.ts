import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";
import { getDatabase } from "@/lib/database";
import { isSupportedCountry } from "@/lib/medical-institutes";
import { importCountryFromOsm } from "@/lib/osm-import";
import { getClientIp } from "@/lib/rate-limit";
import { requireSuperAdmin } from "@/lib/super-admin";

// Importing a whole country from OpenStreetMap can take a few minutes (Italy is the largest).
export const maxDuration = 300;

export async function POST(request: Request) {
  const access = await requireSuperAdmin();
  if ("error" in access) return access.error;

  const body = (await request.json().catch(() => null)) as { country?: unknown } | null;
  const country = typeof body?.country === "string" ? body.country.toUpperCase() : "";
  if (!isSupportedCountry(country)) {
    return NextResponse.json({ error: "Country must be one of RO, AL, IT." }, { status: 400 });
  }

  try {
    const result = await importCountryFromOsm(getDatabase(), country);
    await logActivity({
      actorWorkerId: access.worker.workerId,
      actorName: access.worker.workerName,
      actorEmail: access.email,
      actorRole: access.worker.role,
      action: "medical_institute.osm_import",
      entityType: "medical_institute",
      entityId: country,
      details: result,
      ipAddress: getClientIp(request),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("OpenStreetMap import failed", error);
    return NextResponse.json(
      { error: "Import from OpenStreetMap failed. The public Overpass server may be busy, try again in a few minutes." },
      { status: 502 },
    );
  }
}
