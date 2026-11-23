import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const synthMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/audio/azure-tts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/audio/azure-tts")>();
  return {
    ...actual,
    synthesizeAzureMp3: synthMock,
  };
});

import { POST } from "@/app/api/tts/route";
import { computeTtsHash, evictLocalTtsCache, getCachedTtsAudio, putCachedTtsAudio } from "@/lib/audio/tts-cache";
import { _resetRateLimitMemoryForTest } from "@/lib/rate-limit";

const LOCAL_CACHE_DIR = path.join(os.tmpdir(), "redihealth-tts-cache");

describe("POST /api/tts daily character budget and LRU cache eviction", () => {
  const createdHashes: string[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    _resetRateLimitMemoryForTest();
    vi.stubEnv("REDIHEALTH_TRUST_PROXY_HEADERS", "true");
    vi.stubEnv("AUTH_SECRET", "test-tts-cookie-signing-secret-32chars");
    synthMock.mockResolvedValue({
      audio: Buffer.from("ID3mockmp3"),
      hash: "a".repeat(64),
      voice: "en-US-JennyNeural",
      cached: false,
    });
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    for (const hash of createdHashes) {
      await fs.rm(path.join(LOCAL_CACHE_DIR, `${hash}.mp3`), { force: true });
    }
    createdHashes.length = 0;
  });

  it("enforces per-IP and per-device daily character budgets", async () => {
    vi.stubEnv("TTS_DAILY_CHAR_LIMIT_IP", "100");
    vi.stubEnv("TTS_DAILY_CHAR_LIMIT_DEVICE", "80");

    const req1 = new Request("https://redihealth.org/api/tts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-real-ip": "203.0.113.50",
        "x-device-id": "tts-dev-alpha-0001",
      },
      body: JSON.stringify({ text: "a".repeat(60), lang: "en" }),
    });
    expect((await POST(req1)).status).toBe(200);
    expect(synthMock).toHaveBeenCalledTimes(1);

    // Second request from same device exceeds 80-char device cap (60 + 30 > 80)
    const req2 = new Request("https://redihealth.org/api/tts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-real-ip": "203.0.113.50",
        "x-device-id": "tts-dev-alpha-0001",
      },
      body: JSON.stringify({ text: "b".repeat(30), lang: "en" }),
    });
    const deviceBlocked = await POST(req2);
    expect(deviceBlocked.status).toBe(429);
    expect(await deviceBlocked.json()).toMatchObject({ code: "tts_daily_limit" });
    expect(synthMock).toHaveBeenCalledTimes(1);

    // Another device on the same IP exceeds the 100-char IP cap (60 + 30 + 20 > 100)
    const req3 = new Request("https://redihealth.org/api/tts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-real-ip": "203.0.113.50",
        "x-device-id": "tts-dev-beta-0002",
      },
      body: JSON.stringify({ text: "c".repeat(20), lang: "en" }),
    });
    const ipBlocked = await POST(req3);
    expect(ipBlocked.status).toBe(429);
    expect(await ipBlocked.json()).toMatchObject({ code: "tts_daily_limit" });
  });

  it("evicts oldest cached MP3 files when local cache exceeds maxFiles or maxBytes", async () => {
    const hashes = [0, 1, 2, 3].map((idx) => {
      const h = computeTtsHash({ voice: "test-evict-voice", text: `evict-sample-${Date.now()}-${idx}` });
      createdHashes.push(h);
      return h;
    });

    const payload = Buffer.alloc(1024, 0x41);
    for (let i = 0; i < hashes.length; i += 1) {
      await putCachedTtsAudio(hashes[i], payload);
      const t = new Date(Date.now() - (hashes.length - i) * 10_000);
      await fs.utimes(path.join(LOCAL_CACHE_DIR, `${hashes[i]}.mp3`), t, t);
    }

    // Touch hashes[0] via getCachedTtsAudio so it becomes most recently used
    expect(await getCachedTtsAudio(hashes[0])).not.toBeNull();

    const evicted = await evictLocalTtsCache({ maxFiles: 2, maxBytes: 50 * 1024 * 1024 });
    expect(evicted).toBeGreaterThanOrEqual(2);

    // hashes[0] (just touched) and hashes[3] (newest write) remain; hashes[1] was oldest and evicted
    expect(await getCachedTtsAudio(hashes[0])).not.toBeNull();
    expect(await getCachedTtsAudio(hashes[1])).toBeNull();
  });
});
