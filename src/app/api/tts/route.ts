import { NextResponse, type NextRequest } from "next/server";
import {
  isAzureTtsConfigured,
  synthesizeAzureMp3,
  TtsQuotaExceededError,
  TtsUnconfiguredError,
} from "@/lib/audio/azure-tts";
import { getCachedTtsAudio, getPublicTtsUrl } from "@/lib/audio/tts-cache";
import {
  resolveTtsLang,
  SUPPORTED_TTS_LANGS,
  TTS_OUTPUT_FORMAT,
} from "@/lib/audio/tts-voices";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { attachAiDeviceCookie, resolveAiDeviceIdentity } from "@/lib/security/device-id";

export const runtime = "nodejs";

const HASH_PATTERN = /^[a-f0-9]{64}$/;
const MAX_TTS_TEXT_LENGTH = 5000;
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1_000;
const DEFAULT_DAILY_CHAR_LIMIT_IP = 50_000;
const DEFAULT_DAILY_CHAR_LIMIT_DEVICE = 30_000;

function readPositiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: NextRequest | Request) {
  const searchParams =
    "nextUrl" in request && request.nextUrl
      ? request.nextUrl.searchParams
      : new URL(request.url).searchParams;

  if (searchParams.has("hash")) {
    const hash = searchParams.get("hash") ?? "";
    if (!HASH_PATTERN.test(hash)) {
      return Response.json({ error: "Invalid audio hash." }, { status: 400 });
    }

    const audio = await getCachedTtsAudio(hash);
    if (!audio) {
      return Response.json({ error: "Audio clip not found." }, { status: 404 });
    }

    return new Response(new Uint8Array(audio), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  return Response.json(
    {
      configured: isAzureTtsConfigured(),
      languages: SUPPORTED_TTS_LANGS,
      format: TTS_OUTPUT_FORMAT,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=60",
      },
    },
  );
}

export async function POST(request: NextRequest | Request) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit(`tts-synthesize:${ip}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return Response.json(
      { error: "Too many TTS requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, rl.retryAfterSeconds)),
        },
      },
    );
  }

  let body: { text?: unknown; lang?: unknown };
  try {
    body = (await request.json()) as { text?: unknown; lang?: unknown };
  } catch {
    return Response.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const rawText = body.text;
  const rawLang = body.lang;
  if (typeof rawText !== "string") {
    return Response.json({ error: "Field 'text' must be a string." }, { status: 400 });
  }

  const trimmedLength = rawText.trim().length;
  if (trimmedLength < 1 || trimmedLength > MAX_TTS_TEXT_LENGTH) {
    return Response.json(
      { error: `Text must be between 1 and ${MAX_TTS_TEXT_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const resolvedLang = typeof rawLang === "string" ? resolveTtsLang(rawLang) : null;
  if (!resolvedLang) {
    return Response.json({ error: "Unsupported or invalid TTS language." }, { status: 400 });
  }

  const deviceIdentity = resolveAiDeviceIdentity(request);
  const respondWithCookie = (response: NextResponse) => attachAiDeviceCookie(response, deviceIdentity);

  const dailyIpCharLimit = readPositiveIntEnv("TTS_DAILY_CHAR_LIMIT_IP", DEFAULT_DAILY_CHAR_LIMIT_IP);
  const dailyDeviceCharLimit = readPositiveIntEnv("TTS_DAILY_CHAR_LIMIT_DEVICE", DEFAULT_DAILY_CHAR_LIMIT_DEVICE);

  const ipCharBudget = await checkRateLimit(`tts-daily-chars:ip:${ip}`, {
    limit: dailyIpCharLimit,
    windowMs: DAILY_WINDOW_MS,
    cost: trimmedLength,
  });
  if (!ipCharBudget.allowed) {
    return respondWithCookie(
      NextResponse.json(
        { error: "Daily speech synthesis character limit reached. Please try again tomorrow.", code: "tts_daily_limit" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(1, ipCharBudget.retryAfterSeconds)),
          },
        },
      ),
    );
  }

  for (const deviceKey of deviceIdentity.deviceKeys) {
    const deviceCharBudget = await checkRateLimit(`tts-daily-chars:device:${deviceKey}`, {
      limit: dailyDeviceCharLimit,
      windowMs: DAILY_WINDOW_MS,
      cost: trimmedLength,
    });
    if (!deviceCharBudget.allowed) {
      return respondWithCookie(
        NextResponse.json(
          { error: "Daily speech synthesis character limit reached on this device. Please try again tomorrow.", code: "tts_daily_limit" },
          {
            status: 429,
            headers: {
              "Retry-After": String(Math.max(1, deviceCharBudget.retryAfterSeconds)),
            },
          },
        ),
      );
    }
  }

  try {
    const { audio, hash, voice, cached } = await synthesizeAzureMp3({
      lang: resolvedLang,
      text: rawText,
    });
    const accept = request.headers.get("accept")?.toLowerCase() ?? "";
    if (accept.includes("audio/mpeg")) {
      return respondWithCookie(
        new NextResponse(new Uint8Array(audio), {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Length": String(audio.byteLength),
            "Cache-Control": "private, max-age=86400",
            "X-TTS-Hash": hash,
            "X-TTS-Voice": voice,
            "X-TTS-Cached": cached ? "1" : "0",
          },
        }),
      );
    }
    return respondWithCookie(
      NextResponse.json({
        hash,
        url: getPublicTtsUrl(hash),
        cached,
        voice,
      }),
    );
  } catch (error) {
    if (error instanceof TtsUnconfiguredError) {
      return respondWithCookie(NextResponse.json({ error: error.message }, { status: 503 }));
    }
    if (error instanceof TtsQuotaExceededError) {
      return respondWithCookie(NextResponse.json({ error: error.message }, { status: 429 }));
    }
    console.warn("TTS synthesis failed:", error);
    return respondWithCookie(NextResponse.json({ error: "Speech synthesis failed." }, { status: 502 }));
  }
}
