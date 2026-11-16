import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/staff-access";
import { canAccessMeeting } from "@/lib/record-access";

interface HandoverVignette {
  meetingId?: string | number;
  patientName: string;
  patientAge?: string | number;
  vitals: {
    bloodPressure?: string;
    pulse?: string | number;
    oxygenSaturation?: string | number;
    glucose?: string | number;
    temperature?: string | number;
  };
  reasonForVisit: string;
  languageBarrier: boolean;
  notes?: string;
  mediatorName?: string;
  timestamp?: string;
}

// Short-lived, per-instance hand-off buffer. Nothing reads it across server instances yet, so it is
// kept small and temporary instead of growing for as long as the server runs.
const HANDOVER_TTL_MS = 2 * 60 * 60_000;
const MAX_HANDOVERS = 500;
const activeHandoverStore = new Map<string, { vignette: HandoverVignette; expiresAt: number }>();

function pruneHandovers(now: number) {
  for (const [key, entry] of activeHandoverStore) {
    if (entry.expiresAt <= now) activeHandoverStore.delete(key);
  }
  // Maps iterate in insertion order, so this drops the oldest entries first.
  for (const key of activeHandoverStore.keys()) {
    if (activeHandoverStore.size <= MAX_HANDOVERS) break;
    activeHandoverStore.delete(key);
  }
}

function parseMeetingId(value: unknown): number | null {
  const id = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  return /^\d{1,18}$/.test(id) ? Number(id) : null;
}

function readHandover(key: string): HandoverVignette | null {
  const entry = activeHandoverStore.get(key);
  return entry && entry.expiresAt > Date.now() ? entry.vignette : null;
}

export async function POST(request: Request) {
  try {
    // A handover carries a patient's name, vitals and complaint: staff only.
    const access = await requireStaff();
    if ("error" in access) return access.error;
    const mediatorName = access.worker.workerName || access.name || access.email;
    const country = access.worker.country;

    const body = (await request.json().catch(() => null)) as HandoverVignette | null;

    if (!body || typeof body !== "object" || !body.patientName || !body.reasonForVisit) {
      return NextResponse.json(
        { error: "Numele pacientului și motivul consultației sunt obligatorii." },
        { status: 400 },
      );
    }

    // A handover can only be attached to a meeting this staff member organises or whose patient they look after.
    // A non-numeric id (the field kit's own room names) is not a meeting record, so the handover is kept by its id only.
    const meetingId = parseMeetingId(body.meetingId);
    if (meetingId !== null && !(await canAccessMeeting(access.worker, meetingId))) {
      return NextResponse.json({ error: "Întâlnirea nu a fost găsită." }, { status: 404 });
    }

    const handoverId = `handover-${randomUUID()}`;
    const vignette: HandoverVignette = {
      ...body,
      mediatorName,
      timestamp: new Date().toISOString(),
    };

    const now = Date.now();
    const stored = { vignette, expiresAt: now + HANDOVER_TTL_MS };
    activeHandoverStore.set(`${country}:${handoverId}`, stored);
    if (meetingId !== null) {
      activeHandoverStore.set(`${country}:meeting:${meetingId}`, stored);
    }
    pruneHandovers(now);

    return NextResponse.json({
      success: true,
      handoverId,
      vignette,
      message: "Vigneta clinică a fost transmisă către medicul de gardă.",
    });
  } catch (error) {
    console.error("Error transmitting mediator handover vignette:", error);
    return NextResponse.json({ error: "Predarea cazului nu a putut fi trimisă." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const access = await requireStaff();
  if ("error" in access) return access.error;
  const country = access.worker.country;

  const { searchParams } = new URL(request.url);
  const meetingId = searchParams.get("meetingId");
  const handoverId = searchParams.get("handoverId");

  const meetingRecordId = parseMeetingId(meetingId);
  if (meetingRecordId !== null && !(await canAccessMeeting(access.worker, meetingRecordId))) {
    return NextResponse.json({ vignette: null });
  }

  const vignette =
    (meetingRecordId !== null ? readHandover(`${country}:meeting:${meetingRecordId}`) : null) ??
    (handoverId ? readHandover(`${country}:${handoverId}`) : null);
  if (vignette) return NextResponse.json({ vignette });

  return NextResponse.json({ vignette: null });
}
