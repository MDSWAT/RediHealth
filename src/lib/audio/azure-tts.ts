import {
  computeTtsHash,
  getCachedTtsAudio,
  putCachedTtsAudio,
} from "@/lib/audio/tts-cache";
import {
  getNeuralVoiceConfig,
  TTS_OUTPUT_FORMAT,
  type NeuralVoiceConfig,
} from "@/lib/audio/tts-voices";

const AZURE_TTS_TIMEOUT_MS = 12_000;
const inFlightSyntheses = new Map<string, Promise<Buffer>>();

export class TtsQuotaExceededError extends Error {
  readonly status = 429;

  constructor(message = "Azure Speech quota exceeded.") {
    super(message);
    this.name = "TtsQuotaExceededError";
  }
}

export class TtsUnconfiguredError extends Error {
  readonly status = 503;

  constructor(message = "Azure Speech credentials are not configured.") {
    super(message);
    this.name = "TtsUnconfiguredError";
  }
}

function getAzureSpeechKeys(): string[] {
  const primary = process.env.AZURE_SPEECH_KEY?.trim() ?? "";
  const secondary = process.env.AZURE_SPEECH_KEY_SECONDARY?.trim() ?? "";
  return Array.from(new Set([primary, secondary].filter(Boolean)));
}

/** Returns true when Azure Speech subscription key and region are configured. */
export function isAzureTtsConfigured(): boolean {
  return Boolean(
    getAzureSpeechKeys().length > 0 && process.env.AZURE_SPEECH_REGION?.trim(),
  );
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** Builds an XML-escaped SSML payload for Azure Cognitive Services Speech synthesis. */
export function buildSsml(params: { locale: string; voice: string; text: string }): string {
  const locale = escapeXml(params.locale);
  const voice = escapeXml(params.voice);
  const text = escapeXml(params.text);
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${locale}"><voice xml:lang="${locale}" name="${voice}">${text}</voice></speak>`;
}

async function synthesizeAndCache(
  cfg: NeuralVoiceConfig,
  cleanedText: string,
  hash: string,
): Promise<Buffer> {
  const keys = getAzureSpeechKeys();
  const region = process.env.AZURE_SPEECH_REGION?.trim() ?? "";
  const endpoint = `https://${encodeURIComponent(region)}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const ssml = buildSsml({ locale: cfg.locale, voice: cfg.voice, text: cleanedText });

  const requestSynthesis = (subscriptionKey: string) =>
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": TTS_OUTPUT_FORMAT,
        "User-Agent": "RediHealth-TTS",
      },
      body: ssml,
      signal: AbortSignal.timeout(AZURE_TTS_TIMEOUT_MS),
    });

  let res = await requestSynthesis(keys[0] ?? "");
  if ((res.status === 401 || res.status === 403) && keys.length > 1) {
    res = await requestSynthesis(keys[1]);
  }

  if (res.status === 429) {
    throw new TtsQuotaExceededError("Azure Speech quota exceeded (429).");
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Azure Speech synthesis failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`,
    );
  }

  const audio = Buffer.from(await res.arrayBuffer());
  if (audio.byteLength === 0) {
    throw new Error("Azure Speech returned an empty audio response.");
  }

  await putCachedTtsAudio(hash, audio);
  return audio;
}

/** Synthesizes MP3 speech via Azure REST TTS with SHA-256 caching and per-hash deduplication. */
export async function synthesizeAzureMp3(params: {
  lang: string;
  text: string;
}): Promise<{ audio: Buffer; hash: string; voice: string; cached: boolean }> {
  const cfg = getNeuralVoiceConfig(params.lang);
  if (!cfg) {
    throw new Error(`Unsupported TTS language: ${params.lang}`);
  }

  const cleaned = params.text
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) {
    throw new Error("TTS text is empty after normalization.");
  }

  const hash = computeTtsHash({ voice: cfg.voice, text: cleaned });
  const cachedAudio = await getCachedTtsAudio(hash);
  if (cachedAudio) {
    return { audio: cachedAudio, hash, voice: cfg.voice, cached: true };
  }

  if (!isAzureTtsConfigured()) {
    throw new TtsUnconfiguredError("Azure Speech credentials are not configured.");
  }

  let pending = inFlightSyntheses.get(hash);
  if (!pending) {
    pending = synthesizeAndCache(cfg, cleaned, hash).finally(() => {
      if (inFlightSyntheses.get(hash) === pending) {
        inFlightSyntheses.delete(hash);
      }
    });
    inFlightSyntheses.set(hash, pending);
  }

  const audio = await pending;
  return { audio, hash, voice: cfg.voice, cached: false };
}
