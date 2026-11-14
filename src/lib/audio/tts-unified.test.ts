import { readFileSync } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/tts/route";
import { spokenForm } from "@/components/health-check/spoken-segments";
import { SPEECH_LANG as EXPLAINER_SPEECH_LANG } from "@/components/health-information/explainers/explainer-copy";
import {
  findBestVoice,
  formatSpeechText,
  HealthSpeechEngine,
  splitSpeechSentences,
} from "@/lib/audio/speech-engine";
import {
  computeTtsHash,
  getCachedTtsAudio,
  getPublicTtsUrl,
  isR2CacheConfigured,
  putCachedTtsAudio,
} from "@/lib/audio/tts-cache";
import {
  AZURE_NEURAL_VOICES,
  getNeuralVoiceConfig,
  resolveTtsLang,
  SUPPORTED_TTS_LANGS,
  TTS_OUTPUT_FORMAT,
} from "@/lib/audio/tts-voices";
import { SPEECH_LANG_BY_LOCALE } from "@/lib/i18n/health-myths";
import { languages } from "@/lib/i18n/translations";
import { buildContentSecurityPolicy } from "@/lib/security/csp";

const LOCAL_CACHE_DIR = path.join(os.tmpdir(), "redihealth-tts-cache");

const ENV_KEYS = [
  "AZURE_SPEECH_KEY",
  "AZURE_SPEECH_KEY_SECONDARY",
  "AZURE_SPEECH_REGION",
  "AZURE_SPEECH_VOICE_RO",
  "AZURE_SPEECH_VOICE_EN",
  "AZURE_SPEECH_VOICE_SQ",
  "AZURE_SPEECH_VOICE_IT",
  "AZURE_SPEECH_VOICE_HR",
  "AZURE_SPEECH_VOICE_RU",
  "TTS_R2_ACCOUNT_ID",
  "TTS_R2_ACCESS_KEY_ID",
  "TTS_R2_SECRET_ACCESS_KEY",
  "TTS_R2_BUCKET",
  "TTS_PUBLIC_BASE_URL",
] as const;

const originalFetch = globalThis.fetch;
let savedEnv: Record<string, string | undefined> = {};
const tempHashesToClean = new Set<string>();

function trackTempHash(hash: string): string {
  tempHashesToClean.add(hash);
  return hash;
}

function makeVoice(opts: {
  name: string;
  lang: string;
  localService?: boolean;
  voiceURI?: string;
}): SpeechSynthesisVoice {
  return {
    name: opts.name,
    lang: opts.lang,
    localService: opts.localService ?? false,
    voiceURI: opts.voiceURI ?? opts.name,
    default: false,
  } as SpeechSynthesisVoice;
}

function readRepoFile(relPath: string): string {
  return readFileSync(path.resolve(process.cwd(), relPath), "utf8");
}

beforeEach(() => {
  savedEnv = {};
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
  globalThis.fetch = originalFetch;
});

afterEach(async () => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  }
  for (const hash of tempHashesToClean) {
    await fs.rm(path.join(LOCAL_CACHE_DIR, `${hash}.mp3`), { force: true });
  }
  tempHashesToClean.clear();
});

describe("TTS voice mapping and language resolution", () => {
  it("covers 6 of 7 platform languages while excluding rom", () => {
    expect(languages).toHaveLength(7);
    expect(SUPPORTED_TTS_LANGS).toEqual(["ro", "en", "sq", "it", "hr", "ru"]);
    expect(SUPPORTED_TTS_LANGS).toHaveLength(6);
    expect(TTS_OUTPUT_FORMAT).toBe("audio-16khz-32kbitrate-mono-mp3");
  });

  it("maps ro, en, sq, it, hr, ru and regional tags while returning null for rom and unknown codes", () => {
    const directLangs = ["ro", "en", "sq", "it", "hr", "ru"] as const;
    for (const lang of directLangs) {
      expect(resolveTtsLang(lang)).toBe(lang);
      expect(getNeuralVoiceConfig(lang)).toEqual(AZURE_NEURAL_VOICES[lang]);
    }

    expect(resolveTtsLang("ro-MD")).toBe("ro");
    expect(resolveTtsLang("sq-AL")).toBe("sq");
    expect(resolveTtsLang("it-CH")).toBe("it");
    expect(resolveTtsLang("ru-RU")).toBe("ru");
    expect(resolveTtsLang("en_US")).toBe("en");
    expect(resolveTtsLang("HR-hr")).toBe("hr");

    expect(getNeuralVoiceConfig("ro-MD")?.voice).toBe("ro-RO-AlinaNeural");
    expect(getNeuralVoiceConfig("sq-AL")?.voice).toBe("sq-AL-AnilaNeural");
    expect(getNeuralVoiceConfig("it-CH")?.voice).toBe("it-IT-ElsaNeural");
    expect(getNeuralVoiceConfig("ru-RU")?.voice).toBe("ru-RU-SvetlanaNeural");

    expect(resolveTtsLang("rom")).toBeNull();
    expect(resolveTtsLang("rom-RO")).toBeNull();
    expect(resolveTtsLang("fr")).toBeNull();
    expect(resolveTtsLang("")).toBeNull();
    expect(resolveTtsLang(null)).toBeNull();
    expect(resolveTtsLang(undefined)).toBeNull();

    expect(getNeuralVoiceConfig("rom")).toBeNull();
    expect(getNeuralVoiceConfig("unknown")).toBeNull();
  });

  it("honors AZURE_SPEECH_VOICE_<LANG> environment overrides", () => {
    process.env.AZURE_SPEECH_VOICE_RO = "ro-RO-EmilNeural";
    expect(getNeuralVoiceConfig("ro-MD")).toEqual({
      lang: "ro",
      locale: "ro-RO",
      voice: "ro-RO-EmilNeural",
    });
  });
});

describe("TTS hashing, public URLs, and local filesystem cache", () => {
  it("computes deterministic 64-char SHA-256 hashes over voice, format, and trimmed text", () => {
    const h1 = computeTtsHash({ voice: "ro-RO-AlinaNeural", text: "Bună ziua" });
    const h2 = computeTtsHash({ voice: "ro-RO-AlinaNeural", text: "  Bună ziua  " });
    const h3 = computeTtsHash({ voice: "it-IT-ElsaNeural", text: "Bună ziua" });
    const h4 = computeTtsHash({
      voice: "ro-RO-AlinaNeural",
      text: "Bună ziua",
      format: "audio-24khz-48kbitrate-mono-mp3",
    });

    expect(h1).toMatch(/^[a-f0-9]{64}$/);
    expect(h1).toBe(h2);
    expect(h1).not.toBe(h3);
    expect(h1).not.toBe(h4);
  });

  it("formats public TTS URLs with and without TTS_PUBLIC_BASE_URL", () => {
    const hash = "a".repeat(64);
    expect(getPublicTtsUrl(hash)).toBe(`/api/tts?hash=${hash}`);

    process.env.TTS_PUBLIC_BASE_URL = "https://audio.example.org/";
    expect(getPublicTtsUrl(hash)).toBe(`https://audio.example.org/tts/${hash}.mp3`);

    process.env.TTS_PUBLIC_BASE_URL = "ftp://invalid.example.org";
    expect(getPublicTtsUrl(hash)).toBe(`/api/tts?hash=${hash}`);
  });

  it("round-trips audio through local filesystem cache and validates hashes", async () => {
    expect(isR2CacheConfigured()).toBe(false);
    const hash = trackTempHash(
      computeTtsHash({
        voice: "test-voice",
        text: `cache-roundtrip-${Date.now()}-${Math.random()}`,
      }),
    );
    const payload = Buffer.from([0x49, 0x44, 0x33, 0x04, 0x00, 0x01, 0x02]);

    expect(await getCachedTtsAudio(hash)).toBeNull();
    await putCachedTtsAudio(hash, payload);
    const loaded = await getCachedTtsAudio(hash);
    expect(loaded).not.toBeNull();
    expect(Buffer.compare(loaded!, payload)).toBe(0);

    expect(await getCachedTtsAudio("not-a-valid-hash")).toBeNull();
    await putCachedTtsAudio("../invalid", payload);
  });
});

describe("/api/tts route handlers", () => {
  it("reports configured false vs true on GET /api/tts", async () => {
    const resUnconfigured = await GET(new Request("http://localhost/api/tts"));
    expect(resUnconfigured.status).toBe(200);
    await expect(resUnconfigured.json()).resolves.toEqual({
      configured: false,
      languages: ["ro", "en", "sq", "it", "hr", "ru"],
      format: "audio-16khz-32kbitrate-mono-mp3",
    });

    process.env.AZURE_SPEECH_KEY = "test-key";
    process.env.AZURE_SPEECH_REGION = "westeurope";
    const resConfigured = await GET(new Request("http://localhost/api/tts"));
    expect(resConfigured.status).toBe(200);
    await expect(resConfigured.json()).resolves.toEqual({
      configured: true,
      languages: ["ro", "en", "sq", "it", "hr", "ru"],
      format: "audio-16khz-32kbitrate-mono-mp3",
    });
  });

  it("handles GET /api/tts?hash=... validation, cache miss, and immutable MP3 cache hit", async () => {
    const invalidRes = await GET(new Request("http://localhost/api/tts?hash=badhash"));
    expect(invalidRes.status).toBe(400);

    const missingHash = "b".repeat(64);
    const missRes = await GET(new Request(`http://localhost/api/tts?hash=${missingHash}`));
    expect(missRes.status).toBe(404);

    const hitHash = trackTempHash(
      computeTtsHash({
        voice: "test-route-get",
        text: `route-get-${Date.now()}-${Math.random()}`,
      }),
    );
    const mp3Bytes = Buffer.from([0xff, 0xfb, 0x90, 0x64, 0x11, 0x22]);
    await putCachedTtsAudio(hitHash, mp3Bytes);

    const hitRes = await GET(new Request(`http://localhost/api/tts?hash=${hitHash}`));
    expect(hitRes.status).toBe(200);
    expect(hitRes.headers.get("Content-Type")).toBe("audio/mpeg");
    expect(hitRes.headers.get("Content-Length")).toBe(String(mp3Bytes.byteLength));
    expect(hitRes.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
    const bodyBuf = Buffer.from(await hitRes.arrayBuffer());
    expect(Buffer.compare(bodyBuf, mp3Bytes)).toBe(0);
  });

  it("returns 400 on POST /api/tts for rom, empty text, or over-length text", async () => {
    const romRes = await POST(
      new Request("http://localhost/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Sastipe", lang: "rom" }),
      }),
    );
    expect(romRes.status).toBe(400);

    const emptyRes = await POST(
      new Request("http://localhost/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "   ", lang: "ro" }),
      }),
    );
    expect(emptyRes.status).toBe(400);

    const longRes = await POST(
      new Request("http://localhost/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "a".repeat(5001), lang: "en" }),
      }),
    );
    expect(longRes.status).toBe(400);
  });

  it("returns 503 on POST /api/tts when Azure credentials are unset and text is uncached", async () => {
    const uniqueText = `Uncached synthesis test ${Date.now()}-${Math.random()}`;
    const res = await POST(
      new Request("http://localhost/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: uniqueText, lang: "ro" }),
      }),
    );
    expect(res.status).toBe(503);
  });

  it("synthesizes via Azure REST endpoint with XML escaping, caches result, and skips fetch on repeat POST", async () => {
    process.env.AZURE_SPEECH_KEY = "azure-secret-key";
    process.env.AZURE_SPEECH_REGION = "westeurope";

    const uniqueToken = `${Date.now()}-${Math.random()}`;
    const rawText = `Tensiune < 140 & "normal" 'ok' > 90 ${uniqueToken}`;
    const expectedHash = trackTempHash(
      computeTtsHash({
        voice: "ro-RO-AlinaNeural",
        text: rawText,
      }),
    );

    const fakeMp3 = Uint8Array.from([0xff, 0xfb, 0x90, 0x64, 0xaa, 0xbb]);
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(fakeMp3, {
        status: 200,
        headers: { "Content-Type": "audio/mpeg" },
      }),
    );
    globalThis.fetch = fetchMock;

    const firstRes = await POST(
      new Request("http://localhost/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText, lang: "ro" }),
      }),
    );
    expect(firstRes.status).toBe(200);
    await expect(firstRes.json()).resolves.toEqual({
      hash: expectedHash,
      url: `/api/tts?hash=${expectedHash}`,
      cached: false,
      voice: "ro-RO-AlinaNeural",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [fetchUrl, fetchInit] = fetchMock.mock.calls[0];
    expect(String(fetchUrl)).toBe(
      "https://westeurope.tts.speech.microsoft.com/cognitiveservices/v1",
    );
    expect(fetchInit?.method).toBe("POST");
    const headers = fetchInit?.headers as Record<string, string>;
    expect(headers["Ocp-Apim-Subscription-Key"]).toBe("azure-secret-key");
    expect(headers["Content-Type"]).toBe("application/ssml+xml");
    expect(headers["X-Microsoft-OutputFormat"]).toBe("audio-16khz-32kbitrate-mono-mp3");
    const ssmlBody = String(fetchInit?.body);
    expect(ssmlBody).toContain('xml:lang="ro-RO"');
    expect(ssmlBody).toContain('name="ro-RO-AlinaNeural"');
    expect(ssmlBody).toContain(
      `Tensiune &lt; 140 &amp; &quot;normal&quot; &apos;ok&apos; &gt; 90 ${uniqueToken}`,
    );

    const secondRes = await POST(
      new Request("http://localhost/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText, lang: "ro" }),
      }),
    );
    expect(secondRes.status).toBe(200);
    await expect(secondRes.json()).resolves.toEqual({
      hash: expectedHash,
      url: `/api/tts?hash=${expectedHash}`,
      cached: true,
      voice: "ro-RO-AlinaNeural",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("propagates 429 when mocked Azure Speech returns 429", async () => {
    process.env.AZURE_SPEECH_KEY = "azure-secret-key";
    process.env.AZURE_SPEECH_REGION = "westeurope";

    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("Too Many Requests", { status: 429 }),
    );
    globalThis.fetch = fetchMock;

    const res = await POST(
      new Request("http://localhost/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Quota exceeded test ${Date.now()}-${Math.random()}`,
          lang: "sq",
        }),
      }),
    );
    expect(res.status).toBe(429);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("supports AZURE_SPEECH_KEY_SECONDARY configuration and retries automatically on 401", async () => {
    process.env.AZURE_SPEECH_KEY_SECONDARY = "secondary-secret-key";
    process.env.AZURE_SPEECH_REGION = "eastus";

    const cfgRes = await GET(new Request("http://localhost/api/tts"));
    expect(cfgRes.status).toBe(200);
    await expect(cfgRes.json()).resolves.toMatchObject({ configured: true });

    process.env.AZURE_SPEECH_KEY = "expired-primary-key";
    const uniqueText = `Secondary failover test ${Date.now()}-${Math.random()}`;
    const expectedHash = trackTempHash(
      computeTtsHash({
        voice: "en-GB-SoniaNeural",
        text: uniqueText,
      }),
    );

    const fakeMp3 = Uint8Array.from([0xff, 0xfb, 0x90, 0x64, 0x55, 0x66]);
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("Unauthorized", { status: 401 }))
      .mockResolvedValueOnce(
        new Response(fakeMp3, {
          status: 200,
          headers: { "Content-Type": "audio/mpeg" },
        }),
      );
    globalThis.fetch = fetchMock;

    const postRes = await POST(
      new Request("http://localhost/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: uniqueText, lang: "en" }),
      }),
    );
    expect(postRes.status).toBe(200);
    await expect(postRes.json()).resolves.toEqual({
      hash: expectedHash,
      url: `/api/tts?hash=${expectedHash}`,
      cached: false,
      voice: "en-GB-SoniaNeural",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const firstHeaders = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
    const secondHeaders = fetchMock.mock.calls[1][1]?.headers as Record<string, string>;
    expect(firstHeaders["Ocp-Apim-Subscription-Key"]).toBe("expired-primary-key");
    expect(secondHeaders["Ocp-Apim-Subscription-Key"]).toBe("secondary-secret-key");
  });
});

describe("findBestVoice ranking and zero cross-language fallback", () => {
  it("ranks natural, online, enhanced, and Google voices above compact localService voices", () => {
    const itCompact = makeVoice({ name: "Alice", lang: "it-IT", localService: true });
    const itGoogle = makeVoice({ name: "Google italiano", lang: "it-IT", localService: false });
    const itEnhanced = makeVoice({ name: "Alice (Enhanced)", lang: "it-IT", localService: true });

    expect(findBestVoice([itCompact, itGoogle], "it-IT")).toEqual({
      voice: itGoogle,
      isFallback: false,
    });
    expect(findBestVoice([itCompact, itEnhanced], "it-IT")).toEqual({
      voice: itEnhanced,
      isFallback: false,
    });

    const roCompact = makeVoice({ name: "Ioana", lang: "ro-RO", localService: true });
    const roNatural = makeVoice({
      name: "Microsoft Alina Online (Natural)",
      lang: "ro-RO",
      localService: false,
    });
    expect(findBestVoice([roCompact, roNatural], "ro-RO")).toEqual({
      voice: roNatural,
      isFallback: false,
    });

    const hrCompact = makeVoice({ name: "Lana", lang: "hr-HR", localService: true });
    const hrNatural = makeVoice({
      name: "Microsoft Gabrijela Online (Natural)",
      lang: "hr-HR",
      localService: false,
    });
    expect(findBestVoice([hrCompact, hrNatural], "hr-HR")).toEqual({
      voice: hrNatural,
      isFallback: false,
    });
  });

  it("never selects novelty voice Albert even at index 0", () => {
    const albert = makeVoice({ name: "Albert", lang: "en-US", localService: true });
    const daniel = makeVoice({ name: "Daniel", lang: "en-GB", localService: true });

    expect(findBestVoice([albert], "en-US")).toEqual({
      voice: null,
      isFallback: true,
    });
    expect(findBestVoice([albert, daniel], "en-US")).toEqual({
      voice: daniel,
      isFallback: false,
    });
  });

  it("returns { voice: null, isFallback: true } with zero cross-language English fallback when target language is missing", () => {
    const englishVoices = [
      makeVoice({ name: "Google US English", lang: "en-US", localService: false }),
      makeVoice({ name: "Samantha", lang: "en-US", localService: true }),
    ];

    expect(findBestVoice(englishVoices, "sq-AL")).toEqual({ voice: null, isFallback: true });
    expect(findBestVoice(englishVoices, "ro-RO")).toEqual({ voice: null, isFallback: true });
    expect(findBestVoice(englishVoices, "it-IT")).toEqual({ voice: null, isFallback: true });
    expect(findBestVoice([], "en-GB")).toEqual({ voice: null, isFallback: true });
  });
});

describe("buildContentSecurityPolicy with TTS_PUBLIC_BASE_URL", () => {
  const base = { nonce: "abc123", meetingOrigin: "https://meet.jit.si", isDevelopment: false };

  it("keeps connect-src and media-src clean when TTS_PUBLIC_BASE_URL is unset", () => {
    const policy = buildContentSecurityPolicy(base);
    expect(policy).toContain(
      "connect-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/;",
    );
    expect(policy).toContain("media-src 'self' blob:;");
    expect(policy).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic' 'wasm-unsafe-eval'");
    expect(policy).toContain("frame-ancestors 'none'");
  });

  it("appends TTS_PUBLIC_BASE_URL origin to connect-src and media-src while preserving existing CSP rules", () => {
    process.env.TTS_PUBLIC_BASE_URL = "https://audio.example.org/cdn";
    const policy = buildContentSecurityPolicy(base);
    expect(policy).toContain(
      "connect-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://audio.example.org;",
    );
    expect(policy).toContain("media-src 'self' blob: https://audio.example.org;");
    expect(policy).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic' 'wasm-unsafe-eval'");
    expect(policy).toContain("object-src 'none'");
  });
});

describe("Source invariants: zero ro-RO speech leaks for rom", () => {
  it("keeps rom disabled and free of ro-RO overrides across glossary, prescription, legal rights, and health myths", () => {
    const glossary = readRepoFile("src/components/health-information/RomanesGlossaryDrawer.tsx");
    expect(glossary).toContain('isVoiceEnabled("rom")');
    expect(glossary).not.toMatch(/lang:\s*["']ro-RO["']/);
    expect(glossary).toMatch(/lang:\s*["']rom["']/);

    const prescription = readRepoFile("src/components/health-assistant/PrescriptionAudioPlayer.tsx");
    expect(prescription).toMatch(/rom:\s*\{[^}]*speechLang:\s*["']rom["']/);
    expect(prescription).not.toMatch(/rom:\s*\{[^}]*speechLang:\s*["']ro-RO["']/);

    const legalRights = readRepoFile("src/components/health-assistant/LegalRightsCard.tsx");
    expect(legalRights).toMatch(/rom:\s*\{[^}]*speechLang:\s*["']rom["']/);
    expect(legalRights).not.toMatch(/rom:\s*\{[^}]*speechLang:\s*["']ro-RO["']/);

    const myths = readRepoFile("src/lib/i18n/health-myths.ts");
    expect(SPEECH_LANG_BY_LOCALE.rom).toBe("rom");
    expect(myths).toMatch(/SPEECH_LANG_BY_LOCALE[\s\S]*rom:\s*["']rom["']/);
    expect(myths).not.toMatch(/SPEECH_LANG_BY_LOCALE[\s\S]*rom:\s*["']ro-RO["']/);

    expect(EXPLAINER_SPEECH_LANG.rom).toBe("rom");
    const quiz = readRepoFile("src/components/landing/TrueFalseQuizSection.tsx");
    expect(quiz).toMatch(/en:\s*["']en-GB["']/);
    expect(quiz).toMatch(/rom:\s*["']rom["']/);
    expect(quiz).not.toMatch(/SPEECH_LANG[\s\S]*en-US/);
    expect(quiz).not.toMatch(/rom:\s*["']ro-RO["']/);
  });
});

describe("Pronunciation normalization, clinical units, and idempotency", () => {
  it("normalizes clinical units, percentages, blood pressure, 24/7, comparisons, and punctuation cleanly per locale", () => {
    const roSample =
      "Tensiunea ≥ 140/90 mmHg sau febra 38.5 °C (50%)?. Doza: 1 mg, 2 mg, 500 mg, 5 g, 50 g, 1.5 ml, 400 mcg și/sau 125 mg/dL ori 5.5 mmol/L la 100 km/h, 24/7.. Sunați la 112. . Acum.";
    const roOut = formatSpeechText(roSample, "ro-RO");
    expect(roOut).toContain("cel puțin 140 cu 90 milimetri coloană de mercur");
    expect(roOut).toContain("38,5 grade Celsius");
    expect(roOut).toContain("50 la sută");
    expect(roOut).toContain("1 miligram");
    expect(roOut).toContain("2 miligrame");
    expect(roOut).toContain("500 de miligrame");
    expect(roOut).toContain("5 grame");
    expect(roOut).toContain("50 de grame");
    expect(roOut).toContain("1,5 mililitri");
    expect(roOut).toContain("400 de micrograme");
    expect(roOut).toContain("și sau");
    expect(roOut).toContain("125 miligrame pe decilitru");
    expect(roOut).toContain("5,5 milimoli pe litru");
    expect(roOut).toContain("100 kilometri pe oră");
    expect(roOut).toContain("24 din 24, 7 zile din 7");
    expect(roOut).toContain("unu unu doi");
    expect(roOut).not.toContain("?.");
    expect(roOut).not.toContain("..");
    expect(roOut).not.toContain(". .");

    const enOut = formatSpeechText(
      "BP 140/90 mmHg, temp 38,5 °C, ≤ 50%, 1 mg, 500 mg, 400 mcg, and/or 24/7 at ≥ 100 km/h. Call 112.",
      "en-GB",
    );
    expect(enOut).toContain("140 over 90 millimeters of mercury");
    expect(enOut).toContain("38.5 degrees Celsius");
    expect(enOut).toContain("at most 50 percent");
    expect(enOut).toContain("1 milligram");
    expect(enOut).toContain("500 milligrams");
    expect(enOut).toContain("400 micrograms");
    expect(enOut).toContain("and or");
    expect(enOut).toContain("twenty-four seven");
    expect(enOut).toContain("at least 100 kilometers per hour");
    expect(enOut).toContain("one one two");

    const sqOut = formatSpeechText("140/90 mmHg, 38.5 °C, 50%, 1 mg, 2 mg, dhe/ose 24/7, ≥ 112.", "sq-AL");
    expect(sqOut).toContain("140 me 90 milimetra shtyllë zhive");
    expect(sqOut).toContain("38,5 gradë Celsius");
    expect(sqOut).toContain("50 përqind");
    expect(sqOut).toContain("1 miligram");
    expect(sqOut).toContain("2 miligramë");
    expect(sqOut).toContain("dhe ose");
    expect(sqOut).toContain("24 orë në ditë, 7 ditë në javë");
    expect(sqOut).toContain("të paktën një një dy");

    const itOut = formatSpeechText("140/90 mmHg, 38.5 °C, 50%, 1 mg, 2 mg, e/o 24/7, 112.", "it-IT");
    expect(itOut).toContain("140 su 90 millimetri di mercurio");
    expect(itOut).toContain("38,5 gradi Celsius");
    expect(itOut).toContain("50 percento");
    expect(itOut).toContain("1 milligrammo");
    expect(itOut).toContain("2 milligrammi");
    expect(itOut).toContain("e o");
    expect(itOut).toContain("24 ore su 24, 7 giorni su 7");
    expect(itOut).toContain("uno uno due");

    const hrOut = formatSpeechText("140/90 mmHg, 38.5 °C, 50%, 1 mg, 2 mg, 5 mg, i/ili 24/7, 112.", "hr-HR");
    expect(hrOut).toContain("140 sa 90 milimetara živinog stupca");
    expect(hrOut).toContain("38,5 stupnja Celzija");
    expect(hrOut).toContain("50 posto");
    expect(hrOut).toContain("1 miligram");
    expect(hrOut).toContain("2 miligrama");
    expect(hrOut).toContain("24 sata dnevno, 7 dana u tjednu");
    expect(hrOut).toContain("i ili");
    expect(hrOut).toContain("jedan jedan dva");

    const ruOut = formatSpeechText(
      "140/90 mmHg, 38.5 °C, 1%, 2%, 5%, 1 mg, 2 mg, 5 mg, и/или 24/7, ≥ 112.",
      "ru-RU",
    );
    expect(ruOut).toContain("140 на 90 миллиметров ртутного столба");
    expect(ruOut).toContain("38,5 градуса Цельсия");
    expect(ruOut).toContain("1 процент");
    expect(ruOut).toContain("2 процента");
    expect(ruOut).toContain("5 процентов");
    expect(ruOut).toContain("1 миллиграмм");
    expect(ruOut).toContain("2 миллиграмма");
    expect(ruOut).toContain("5 миллиграммов");
    expect(ruOut).toContain("и или");
    expect(ruOut).toContain("круглосуточно, 7 дней в неделю");
    expect(ruOut).toContain("не менее один один два");
  });

  it("preserves ISO dates, dotted dates, English thousands separators, and hyphenated phone numbers", () => {
    for (const locale of ["ro-RO", "en-GB", "sq-AL", "it-IT", "hr-HR", "ru-RU"]) {
      const formatted = formatSpeechText(
        "Data 2026-11-14 și 07.11.2026, tel 0800-800-200 sau +40-21-318-0522, 10-15 min.",
        locale,
      );
      expect(formatted).toContain("2026-11-14");
      expect(formatted).toContain("07.11.2026");
      expect(formatted).toContain("0800-800-200");
      expect(formatted).toContain("+40-21-318-0522");
      expect(formatted).not.toContain("2026 până la");
      expect(formatted).not.toContain("0800 până la");
      expect(formatted).not.toContain("10-15");
    }

    expect(formatSpeechText("Over 1,000 clinics and 38,5 °C", "en-GB")).toContain("1,000");
    expect(formatSpeechText("Over 1,000 clinics and 38,5 °C", "en-GB")).toContain("38.5 degrees Celsius");
  });

  it("is strictly idempotent across all 6 speech locales", () => {
    const corpus = [
      "Tensiune 140/90 mmHg, febră 38.5 °C, 50% risc, 5 g sare, 500 mg paracetamol, și/sau 24/7.",
      "BP 130/80 mmHg, temp 37.2 °C, 1 mg, 200 mcg, ≥ 125 mg/dL, ≤ 5.5 mmol/L, 100 km/h, 10-15 min.",
      "Publicat pe 2026-11-14 (07.11.2026). Tel: 0800-800-200, +40-21-318-0522. Urgențe: 112?. .",
    ].join(" ");

    for (const locale of ["ro-RO", "en-GB", "sq-AL", "it-IT", "hr-HR", "ru-RU"]) {
      const once = formatSpeechText(corpus, locale);
      const twice = formatSpeechText(once, locale);
      expect(twice).toBe(once);
    }
  });

  it("preserves Romanian noun gender and expands natural duration phrases in spokenForm", () => {
    expect(spokenForm("ro", "De 1–2 săptămâni")).toBe("Între una și două săptămâni");
    expect(spokenForm("ro", "1–2 săptămâni")).toBe("una până la două săptămâni");
    expect(spokenForm("ro", "De 2–7 zile")).toBe("Între 2 și 7 zile");
    expect(spokenForm("ro", "2–7 zile")).toBe("2 până la 7 zile");
    expect(spokenForm("ro", "Sub 1 oră și sub 2 ani")).toBe("Sub 1 oră și sub 2 ani");
    expect(spokenForm("ro", "Maxim 5 g pe zi")).toBe("Maxim 5 g pe zi");
    expect(spokenForm("ro", "Sună la 112")).toBe("Sună la unu unu doi");
    expect(spokenForm("ro", "2026-11-14 / 0800-800-200")).toBe("2026-11-14 / 0800-800-200");
  });
});

describe("Sentence splitting, quiz spoiler guard, player lifecycle, and endReason tracking", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    HealthSpeechEngine.getInstance().resetForTests();
  });

  it("keeps decimals attached inside splitSpeechSentences while preserving accurate character offsets", () => {
    const text = "Temperatura 38.5 °C necesită hidratare. Sunați la 112?! Urgent! Da.";
    const spans = splitSpeechSentences(text);
    expect(spans).toHaveLength(4);
    expect(spans[0]?.text).toBe("Temperatura 38.5 °C necesită hidratare. ");
    expect(spans[1]?.text).toBe("Sunați la 112?! ");
    expect(spans[2]?.text).toBe("Urgent! ");
    expect(spans[3]?.text).toBe("Da.");
    for (const span of spans) {
      expect(text.slice(span.startChar, span.endChar)).toBe(span.text);
    }
  });

  it("distinguishes natural completion from intentional stop() via getLastEndReason()", async () => {
    const utterances: Array<{ onend: (() => void) | null }> = [];
    class MockUtterance {
      lang = "";
      rate = 1;
      voice: SpeechSynthesisVoice | null = null;
      onboundary: ((e: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      text: string;
      constructor(text: string) {
        this.text = text;
        utterances.push(this);
      }
    }

    const synthMock = {
      getVoices: () => [makeVoice({ name: "Ioana", lang: "ro-RO", localService: true })],
      speak: vi.fn((u: MockUtterance) => {
        void u;
      }),
      cancel: vi.fn(),
    };

    vi.stubGlobal("window", { speechSynthesis: synthMock });
    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ configured: false }), { status: 200 }),
    );

    const engine = HealthSpeechEngine.getInstance();
    engine.resetForTests();
    await engine.probeNeuralServer();

    let endReasonOnNaturalEnd: string | null = null;
    engine.speak("Primul enunț.", {
      lang: "ro-RO",
      onEnd: () => {
        endReasonOnNaturalEnd = engine.getLastEndReason();
      },
    });
    expect(utterances).toHaveLength(1);
    utterances[0].onend?.();
    expect(endReasonOnNaturalEnd).toBe("completed");
    expect(engine.getLastEndReason()).toBe("completed");

    let endReasonOnStop: string | null = null;
    engine.speak("Al doilea enunț.", {
      lang: "ro-RO",
      onEnd: () => {
        endReasonOnStop = engine.getLastEndReason();
      },
    });
    engine.stop();
    expect(endReasonOnStop).toBe("stopped");
    expect(engine.getLastEndReason()).toBe("stopped");
  });

  it("enforces audio UI lifecycle invariants across LegalRightsCard, GlobalHealthAudioPlayer, TopicDetailPageContent, and TrueFalseQuizSection", () => {
    const legalCard = readRepoFile("src/components/health-assistant/LegalRightsCard.tsx");
    expect(legalCard).toContain("useRef(false)");
    expect(legalCard).toMatch(/useEffect\(\(\)\s*=>\s*\{\s*return\s*\(\)\s*=>\s*\{[\s\S]*isPlayingRef\.current[\s\S]*\},\s*\[\]\)/);
    expect(legalCard).toContain("`${t.heading}.`");

    const quiz = readRepoFile("src/components/landing/TrueFalseQuizSection.tsx");
    expect(quiz).toContain(
      "hasAnswered\n                        ? `${currentMyth.statement}. ${currentMyth.explanation}`\n                        : currentMyth.statement",
    );

    const player = readRepoFile("src/components/health-information/GlobalHealthAudioPlayer.tsx");
    expect(player).toContain("playbackGenRef");
    expect(player).toContain('speechEngine.getLastEndReason() === "completed"');
    expect(player).toContain("splitSpeechSentences");

    const topicDetail = readRepoFile("src/components/health-information/TopicDetailPageContent.tsx");
    expect(topicDetail).toMatch(/closeAudioPlayer\s*=\s*useCallback\(\(\)\s*=>\s*\{[\s\S]*setIsAudioPlayerOpen\(false\)[\s\S]*setActiveSentenceIndex\(null\)/);
  });
});
