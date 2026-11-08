import { NextResponse } from "next/server";
import { auth } from "@/auth";

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

// In-memory active handover store for physician video room ingestion
const activeHandoverStore = new Map<string, HandoverVignette>();

export async function POST(request: Request) {
  try {
    const session = await auth();
    let mediatorName = "Elena Rădulescu (Mediator sanitar)";

    if (session?.user?.name) {
      mediatorName = session.user.name;
    }

    const body = (await request.json()) as HandoverVignette;

    if (!body.patientName || !body.reasonForVisit) {
      return NextResponse.json(
        { error: "Numele pacientului și motivul consultației sunt obligatorii." },
        { status: 400 },
      );
    }

    const handoverId = `handover-${Date.now()}`;
    const vignette: HandoverVignette = {
      ...body,
      mediatorName,
      timestamp: new Date().toISOString(),
    };

    activeHandoverStore.set(handoverId, vignette);
    if (body.meetingId) {
      activeHandoverStore.set(String(body.meetingId), vignette);
    }

    console.info(`[MEDIATOR_HANDOVER] Transmitted clinical vignette for ${body.patientName} by ${mediatorName}`);

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
  const { searchParams } = new URL(request.url);
  const meetingId = searchParams.get("meetingId");
  const handoverId = searchParams.get("handoverId");

  if (meetingId && activeHandoverStore.has(meetingId)) {
    return NextResponse.json({ vignette: activeHandoverStore.get(meetingId) });
  }
  if (handoverId && activeHandoverStore.has(handoverId)) {
    return NextResponse.json({ vignette: activeHandoverStore.get(handoverId) });
  }

  return NextResponse.json({ vignette: null });
}
