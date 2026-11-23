import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { text } from "@/lib/text";
import { getUserWorkerContext } from "@/lib/worker-auth";

type TranscriptionResponse = {
  text?: unknown;
};

const TRANSCRIPTION_TIMEOUT_MS = 120_000;
const DEFAULT_RELAY_BASE_URL = "https://api.llmsrelay.com";

const ALLOWED_AUDIO_MIME_TO_FILENAME: Record<string, string> = {
  "audio/webm": "recording.webm",
  "video/webm": "recording.webm",
  "audio/ogg": "recording.ogg",
  "application/ogg": "recording.ogg",
  "audio/mpeg": "recording.mp3",
  "audio/mp3": "recording.mp3",
  "audio/mp4": "recording.m4a",
  "audio/m4a": "recording.m4a",
  "audio/x-m4a": "recording.m4a",
  "audio/wav": "recording.wav",
  "audio/wave": "recording.wav",
  "audio/x-wav": "recording.wav",
  "audio/flac": "recording.flac",
  "audio/x-flac": "recording.flac",
};

function resolveSafeAudioFilename(mimeType: string | undefined): string | null {
  if (!mimeType) return null;
  const baseMime = mimeType.split(";")[0]?.trim().toLowerCase() ?? "";
  return ALLOWED_AUDIO_MIME_TO_FILENAME[baseMime] ?? null;
}

function resolveValidatedRelayBaseUrl(rawValue: string | undefined): string | null {
  const candidate = rawValue?.trim().replace(/\/+$/, "") || DEFAULT_RELAY_BASE_URL;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }

  if (parsed.protocol === "https:") {
    return candidate;
  }

  if (
    parsed.protocol === "http:" &&
    process.env.NODE_ENV !== "production" &&
    (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
  ) {
    return candidate;
  }

  return null;
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
  filename,
  language,
}: {
  baseUrl: string;
  apiKey: string;
  model?: string;
  file: Blob;
  filename: string;
  language: string;
}): Promise<Response> {
  const body = new FormData();
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
    signal: AbortSignal.timeout(TRANSCRIPTION_TIMEOUT_MS),
  });

  if (primary.status !== 404) {
    return primary;
  }

  const legacy = await fetch(`${baseUrl}/v1/transcriptions`, {
    method: "POST",
    headers,
    body,
    signal: AbortSignal.timeout(TRANSCRIPTION_TIMEOUT_MS),
  });

  return legacy;
}

export async function POST(request: Request) {
  const access = await requireWorker();
  if ("error" in access) return access.error;

  const rateLimit = await checkRateLimit(`meetings-transcribe:${access.worker.workerId}:${getClientIp(request)}`, {
    limit: 20,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many transcription requests. Try again in a minute." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const relayApiKey = process.env.LLMSRELAY_API_KEY?.trim().replace(/^["']|["']$/g, "") || "";
  if (!relayApiKey) {
    return NextResponse.json(
      { error: "Transcription is not available right now." },
      { status: 503 },
    );
  }

  const relayBaseUrl = resolveValidatedRelayBaseUrl(process.env.LLMSRELAY_BASE_URL);
  if (!relayBaseUrl) {
    console.error("Invalid LLMSRELAY_BASE_URL configuration: must use https://");
    return NextResponse.json(
      { error: "Transcription is not available right now." },
      { status: 503 },
    );
  }
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

  const safeFilename = resolveSafeAudioFilename(audio.type);
  if (!safeFilename) {
    return NextResponse.json({ error: "Unsupported audio format." }, { status: 400 });
  }

  try {
    const response = await requestRelayTranscription({
      baseUrl: relayBaseUrl,
      apiKey: relayApiKey,
      model,
      file: audio,
      filename: safeFilename,
      language,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error("Meeting transcription failed", response.status, errorText.slice(0, 400));

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: "Transcription is not available right now." },
          { status: 503 },
        );
      }
      if (response.status === 413) {
        return NextResponse.json({ error: "Audio file is too large for transcription." }, { status: 400 });
      }
      if (response.status === 429) {
        return NextResponse.json({ error: "Transcription is busy. Try again in a minute." }, { status: 429 });
      }

      return NextResponse.json({ error: "Transcription is not available right now." }, { status: 502 });
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
