import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getUserWorkerContext } from "@/lib/worker-auth";

type TranscriptionResponse = {
  text?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function requireWorker() {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }

  const worker = await getUserWorkerContext(session.user.email);
  if (!worker.workerId) {
    return { error: NextResponse.json({ error: "Staff access is required." }, { status: 403 }) };
  }

  return { worker };
}

async function requestRelayTranscription({
  baseUrl,
  apiKey,
  model,
  file,
  language,
}: {
  baseUrl: string;
  apiKey: string;
  model?: string;
  file: Blob;
  language: string;
}): Promise<Response> {
  const body = new FormData();
  const filename = "name" in file && typeof (file as File).name === "string" && (file as File).name
    ? (file as File).name
    : "meeting-audio.webm";

  body.append("file", file, filename);
  if (model) {
    body.append("model", model);
  }
  if (language) {
    body.append("language", language);
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
  };

  const primary = await fetch(`${baseUrl}/v1/audio/transcriptions`, {
    method: "POST",
    headers,
    body,
  });

  if (primary.status !== 404) {
    return primary;
  }

  const legacy = await fetch(`${baseUrl}/v1/transcriptions`, {
    method: "POST",
    headers,
    body,
  });

  return legacy;
}

export async function POST(request: Request) {
  const access = await requireWorker();
  if ("error" in access) return access.error;

  const rateLimit = checkRateLimit(`meetings-transcribe:${access.worker.workerId}:${getClientIp(request)}`, {
    limit: 20,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many transcription requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const relayApiKey = process.env.LLMSRELAY_API_KEY?.trim().replace(/^["']|["']$/g, "") || "";
  if (!relayApiKey) {
    return NextResponse.json(
      { error: "Transcription is not configured. Add LLMSRELAY_API_KEY to .env.local." },
      { status: 503 },
    );
  }

  const relayBaseUrl = (process.env.LLMSRELAY_BASE_URL?.trim().replace(/\/$/, "") || "https://api.llmsrelay.com");
  const model = process.env.LLMSRELAY_TRANSCRIPTION_MODEL?.trim().replace(/^["']|["']$/g, "") || undefined;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid audio payload." }, { status: 400 });
  }

  const audio = formData.get("audio");
  const language = text(formData.get("language"));

  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: "Audio file is required." }, { status: 400 });
  }

  const maxSizeBytes = 25 * 1024 * 1024;
  if (audio.size <= 0 || audio.size > maxSizeBytes) {
    return NextResponse.json({ error: "Audio file must be between 1 byte and 25 MB." }, { status: 400 });
  }

  try {
    const response = await requestRelayTranscription({
      baseUrl: relayBaseUrl,
      apiKey: relayApiKey,
      model,
      file: audio,
      language,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("Meeting transcription failed", response.status, errorText.slice(0, 400));

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: "Transcription authentication failed. Re-check LLMSRELAY_API_KEY." },
          { status: 503 },
        );
      }
      if (response.status === 413) {
        return NextResponse.json({ error: "Audio file is too large for transcription." }, { status: 400 });
      }
      if (response.status === 429) {
        return NextResponse.json({ error: "Transcription provider is rate-limiting requests. Please retry shortly." }, { status: 429 });
      }

      return NextResponse.json({ error: "Transcription provider is unavailable right now." }, { status: 502 });
    }

    const data = (await response.json()) as TranscriptionResponse;
    const transcriptionText = text(data.text);
    if (!transcriptionText) {
      return NextResponse.json({ error: "Transcription service returned no text." }, { status: 502 });
    }

    return NextResponse.json({ text: transcriptionText });
  } catch (error) {
    console.error("Meeting transcription request crashed", error);
    return NextResponse.json({ error: "Could not transcribe audio." }, { status: 503 });
  }
}
