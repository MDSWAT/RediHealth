import { createHash, createHmac } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { TTS_OUTPUT_FORMAT } from "@/lib/audio/tts-voices";

const HASH_PATTERN = /^[a-f0-9]{64}$/;
const LOCAL_CACHE_DIR = path.join(os.tmpdir(), "redihealth-tts-cache");
const R2_TIMEOUT_MS = 8_000;

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

function getR2Config(): R2Config | null {
  const accountId = process.env.TTS_R2_ACCOUNT_ID?.trim() ?? "";
  const accessKeyId = process.env.TTS_R2_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey = process.env.TTS_R2_SECRET_ACCESS_KEY?.trim() ?? "";
  const bucket = process.env.TTS_R2_BUCKET?.trim() ?? "";
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

function sha256Hex(data: string | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

function hmacSha256(key: string | Buffer, data: string): Buffer {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

function formatAmzDate(date = new Date()): { amzDate: string; dateStamp: string } {
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return { amzDate, dateStamp: amzDate.slice(0, 8) };
}

function localCachePath(hash: string): string {
  return path.join(LOCAL_CACHE_DIR, `${hash}.mp3`);
}

function buildR2SignedRequest(params: {
  method: "GET" | "PUT";
  hash: string;
  config: R2Config;
  body?: Buffer;
}): { url: string; headers: Record<string, string> } {
  const { method, hash, config, body } = params;
  const host = `${config.accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${encodeURIComponent(config.bucket)}/tts/${hash}.mp3`;
  const url = `https://${host}${canonicalUri}`;
  const service = "s3";
  const region = "auto";
  const { amzDate, dateStamp } = formatAmzDate();
  const payloadHash = sha256Hex(body ?? "");

  const signableHeaders: Record<string, string> = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  if (method === "PUT") {
    signableHeaders["cache-control"] = "public, max-age=31536000, immutable";
    signableHeaders["content-type"] = "audio/mpeg";
  }

  const sortedHeaderNames = Object.keys(signableHeaders).sort();
  const canonicalHeaders = sortedHeaderNames
    .map((name) => `${name}:${signableHeaders[name]}\n`)
    .join("");
  const signedHeaders = sortedHeaderNames.join(";");

  const canonicalRequest = [
    method,
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = hmacSha256(`AWS4${config.secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, "aws4_request");
  const signature = createHmac("sha256", kSigning).update(stringToSign, "utf8").digest("hex");

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const requestHeaders: Record<string, string> = {
    Authorization: authorization,
    "x-amz-date": amzDate,
    "x-amz-content-sha256": payloadHash,
  };

  if (method === "PUT") {
    requestHeaders["Content-Type"] = "audio/mpeg";
    requestHeaders["Cache-Control"] = "public, max-age=31536000, immutable";
  }

  return { url, headers: requestHeaders };
}

async function writeLocalCache(hash: string, audio: Buffer): Promise<void> {
  try {
    await fs.mkdir(LOCAL_CACHE_DIR, { recursive: true });
    const tmpName = `${hash}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`;
    const tmpPath = path.join(LOCAL_CACHE_DIR, tmpName);
    await fs.writeFile(tmpPath, audio);
    await fs.rename(tmpPath, localCachePath(hash));
  } catch (error) {
    console.warn("Local TTS cache write failed:", error);
  }
}

/** Computes a stable SHA-256 cache key for synthesized TTS audio. */
export function computeTtsHash(params: { voice: string; text: string; format?: string }): string {
  const format = params.format ?? TTS_OUTPUT_FORMAT;
  return sha256Hex(`${params.voice}|${format}|${params.text.trim()}`);
}

/** Returns true when all Cloudflare R2 S3-compatible cache environment variables are set. */
export function isR2CacheConfigured(): boolean {
  return getR2Config() !== null;
}

/** Reads cached MP3 audio from local tmpdir first, falling back to Cloudflare R2 if configured. */
export async function getCachedTtsAudio(hash: string): Promise<Buffer | null> {
  if (!HASH_PATTERN.test(hash)) {
    return null;
  }

  try {
    const localAudio = await fs.readFile(localCachePath(hash));
    if (localAudio.byteLength > 0) {
      return localAudio;
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException | null)?.code;
    if (code !== "ENOENT") {
      console.warn("Local TTS cache read failed:", error);
    }
  }

  const r2 = getR2Config();
  if (!r2) {
    return null;
  }

  try {
    const { url, headers } = buildR2SignedRequest({
      method: "GET",
      hash,
      config: r2,
    });
    const res = await fetch(url, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(R2_TIMEOUT_MS),
    });

    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      console.warn(`R2 TTS cache GET failed with status ${res.status}`);
      return null;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0) {
      return null;
    }

    await writeLocalCache(hash, buf);
    return buf;
  } catch (error) {
    console.warn("R2 TTS cache GET error:", error);
    return null;
  }
}

/** Writes synthesized MP3 audio to local tmpdir cache and Cloudflare R2 when configured. */
export async function putCachedTtsAudio(hash: string, audio: Buffer): Promise<void> {
  if (!HASH_PATTERN.test(hash) || audio.byteLength === 0) {
    return;
  }

  await writeLocalCache(hash, audio);

  const r2 = getR2Config();
  if (!r2) {
    return;
  }

  try {
    const { url, headers } = buildR2SignedRequest({
      method: "PUT",
      hash,
      config: r2,
      body: audio,
    });
    const res = await fetch(url, {
      method: "PUT",
      headers,
      body: new Uint8Array(audio),
      signal: AbortSignal.timeout(R2_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.warn(`R2 TTS cache PUT failed with status ${res.status}`);
    }
  } catch (error) {
    console.warn("R2 TTS cache PUT error:", error);
  }
}

/** Returns the public CDN URL when TTS_PUBLIC_BASE_URL is configured, otherwise the local API route. */
export function getPublicTtsUrl(hash: string): string {
  const rawBase = process.env.TTS_PUBLIC_BASE_URL?.trim();
  if (rawBase) {
    try {
      const parsed = new URL(rawBase);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return `${rawBase.replace(/\/+$/, "")}/tts/${hash}.mp3`;
      }
    } catch {
      // Fall back to same-origin API route when TTS_PUBLIC_BASE_URL is invalid.
    }
  }
  return `/api/tts?hash=${hash}`;
}
