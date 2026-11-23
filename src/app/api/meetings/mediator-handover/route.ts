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

interface StoredHandover {
  handoverId: string;
  vignette: HandoverVignette;
  creatorWorkerId: string;
  meetingId: number | null;
  expiresAt: number;
}

// Short-lived, per-instance hand-off buffers. Handover IDs and meeting IDs live in separate maps
// so a crafted handoverId (e.g. "meeting:123") can never collide with a meeting lookup key.
const HANDOVER_TTL_MS = 2 * 60 * 60_000;
const MAX_HANDOVERS = 500;
const HANDOVER_ID_RE = /^handover-[0-9a-f-]{36}$/i;
const byHandoverId = new Map<string, StoredHandover>();
const byMeetingId = new Map<string, StoredHandover>();

function pruneMap(map: Map<string, StoredHandover>, now: number) {
  for (const [key, entry] of map) {
    if (entry.expiresAt <= now) map.delete(key);
  }
  // Maps iterate in insertion order, so this drops the oldest entries first.
  for (const key of map.keys()) {
    if (map.size <= MAX_HANDOVERS) break;
    map.delete(key);
  }
}

function pruneHandovers(now: number) {
  pruneMap(byHandoverId, now);
  pruneMap(byMeetingId, now);
}

function parseMeetingId(value: unknown): number | null {
  const id = typeof value === "number" ? String(value) : typeof value === "string" ? value.trim() : "";
  return /^\d{1,18}$/.test(id) ? Number(id) : null;
}

function readStored(map: Map<string, StoredHandover>, key: string): StoredHandover | null {
  const entry = map.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    map.delete(key);
    return null;
  }
  return entry;
}

async function canReadHandover(
  worker: Parameters<typeof canAccessMeeting>[0],
  entry: StoredHandover,
): Promise<boolean> {
  if (worker.isAdmin) return true;
  if (entry.meetingId !== null) {
    return canAccessMeeting(worker, entry.meetingId);
  }
  return entry.creatorWorkerId === worker.workerId;
}

export async function POST(request: Request) {
  try {
    // A handover carries a patient's name, vitals and complaint: staff only.
    const access = await requireStaff();
    if ("error" in access) return access.error;
    const mediatorName = access.worker.workerName || access.name || access.email;
    const country = access.worker.country;

    const body = (await request.json().catch(() => null)) as HandoverVignette | null;

    if (!body || typeof body !== "object" || Array.isArray(body) || !body.patientName || !body.reasonForVisit) {
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
    const stored: StoredHandover = {
      handoverId,
      vignette,
      creatorWorkerId: access.worker.workerId,
      meetingId,
      expiresAt: now + HANDOVER_TTL_MS,
    };
    byHandoverId.set(`${country}:${handoverId}`, stored);
    if (meetingId !== null) {
      byMeetingId.set(`${country}:${meetingId}`, stored);
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
  const rawMeetingId = searchParams.get("meetingId");
  const rawHandoverId = searchParams.get("handoverId")?.trim() || null;

  const meetingRecordId = parseMeetingId(rawMeetingId);
  if (meetingRecordId !== null) {
    if (!(await canAccessMeeting(access.worker, meetingRecordId))) {
      return NextResponse.json({ vignette: null });
    }
    const entry = readStored(byMeetingId, `${country}:${meetingRecordId}`);
    if (entry) return NextResponse.json({ vignette: entry.vignette });
  }

  if (rawHandoverId && HANDOVER_ID_RE.test(rawHandoverId)) {
    const entry = readStored(byHandoverId, `${country}:${rawHandoverId}`);
    if (entry && (await canReadHandover(access.worker, entry))) {
      return NextResponse.json({ vignette: entry.vignette });
    }
  }

  return NextResponse.json({ vignette: null });
}
