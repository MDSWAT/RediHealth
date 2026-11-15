import { isIP } from "node:net";
import { NextResponse } from "next/server";
import {
  langFromTimezone,
  resolveLangForCountry,
  timezoneFromHeaders,
} from "@/lib/i18n/locale-detection";
import type { Lang } from "@/lib/i18n/translations";
import { countryFromHeaders } from "@/lib/medical-institutes";

export const dynamic = "force-dynamic";

const CACHE_CONTROL = "private, max-age=3600";
const GEO_IP_TIMEOUT_MS = 650;

type GeoLocaleSource = "header" | "timezone" | "geoip" | "none";

function jsonGeoResponse(
  country: string | null,
  lang: Lang | null,
  source: GeoLocaleSource,
) {
  return NextResponse.json(
    { country, lang, source },
    {
      status: 200,
      headers: {
        "Cache-Control": CACHE_CONTROL,
      },
    },
  );
}

function normalizeIpCandidate(raw: string): string | null {
  let candidate = raw.trim();
  if (!candidate) return null;

  if (candidate.startsWith("[")) {
    const endBracket = candidate.indexOf("]");
    if (endBracket === -1) return null;
    candidate = candidate.slice(1, endBracket);
  } else if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(candidate)) {
    candidate = candidate.replace(/:\d+$/, "");
  }

  const zoneIndex = candidate.indexOf("%");
  if (zoneIndex !== -1) {
    candidate = candidate.slice(0, zoneIndex);
  }

  const lower = candidate.toLowerCase();
  if (lower.startsWith("::ffff:")) {
    const rest = lower.slice(7);
    if (isIP(rest) === 4) {
      return rest;
    }
  }

  return isIP(candidate) !== 0 ? candidate : null;
}

function isPrivateOrReservedIpv4(ip: string): boolean {
  const octets = ip.split(".").map(Number);
  if (octets.length !== 4 || octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return true;
  }
  const [a, b, c] = octets;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return true;
  if (a === 192 && b === 168) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a === 198 && b === 51 && c === 100) return true;
  if (a === 203 && b === 0 && c === 113) return true;
  return false;
}

function expandIpv6(ip: string): number[] | null {
  const lower = ip.toLowerCase();
  const halves = lower.split("::");
  if (halves.length > 2) return null;

  const parseSide = (side: string): number[] | null => {
    if (!side) return [];
    const parts = side.split(":");
    const words: number[] = [];
    for (const part of parts) {
      if (part.includes(".")) {
        const octets = part.split(".").map(Number);
        if (octets.length !== 4 || octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
          return null;
        }
        words.push((octets[0] << 8) | octets[1], (octets[2] << 8) | octets[3]);
      } else {
        if (!/^[0-9a-f]{1,4}$/.test(part)) return null;
        words.push(parseInt(part, 16));
      }
    }
    return words;
  };

  const left = parseSide(halves[0]);
  if (!left) return null;
  if (halves.length === 1) {
    return left.length === 8 ? left : null;
  }

  const right = parseSide(halves[1]);
  if (!right) return null;
  const missing = 8 - left.length - right.length;
  if (missing < 1) return null;

  return [...left, ...new Array<number>(missing).fill(0), ...right];
}

function isPrivateOrReservedIpv6(ip: string): boolean {
  const words = expandIpv6(ip);
  if (!words) return true;

  const isAllZeroPrefix = words.slice(0, 7).every((w) => w === 0);
  if (isAllZeroPrefix && (words[7] === 0 || words[7] === 1)) return true;

  if (
    words[0] === 0 && words[1] === 0 && words[2] === 0 &&
    words[3] === 0 && words[4] === 0 && words[5] === 0xffff
  ) {
    const v4 = `${words[6] >> 8}.${words[6] & 0xff}.${words[7] >> 8}.${words[7] & 0xff}`;
    return isPrivateOrReservedIpv4(v4);
  }

  const first = words[0];
  if ((first & 0xfe00) === 0xfc00) return true;
  if ((first & 0xffc0) === 0xfe80) return true;
  if ((first & 0xff00) === 0xff00) return true;
  if (first === 0x2001 && words[1] === 0x0db8) return true;

  return false;
}

function extractPublicClientIp(headers: Pick<Headers, "get">): string | null {
  const forwarded = headers.get("x-forwarded-for");
  const rawCandidate = forwarded
    ? forwarded.split(",")[0] ?? ""
    : headers.get("x-real-ip") ?? "";

  const normalized = normalizeIpCandidate(rawCandidate);
  if (!normalized) return null;

  const version = isIP(normalized);
  if (version === 4) {
    return isPrivateOrReservedIpv4(normalized) ? null : normalized;
  }
  if (version === 6) {
    return isPrivateOrReservedIpv6(normalized) ? null : normalized;
  }
  return null;
}

export async function GET(request: Request) {
  const acceptLanguage = request.headers.get("accept-language");
  const headerCountry = countryFromHeaders(request.headers);

  if (headerCountry) {
    const headerLang = resolveLangForCountry(headerCountry, acceptLanguage);
    if (headerLang) {
      return jsonGeoResponse(headerCountry, headerLang, "header");
    }
  }

  const timezoneLang = langFromTimezone(timezoneFromHeaders(request.headers));
  if (timezoneLang) {
    return jsonGeoResponse(headerCountry, timezoneLang, "timezone");
  }

  if (headerCountry) {
    return jsonGeoResponse(headerCountry, null, "header");
  }

  const publicIp = extractPublicClientIp(request.headers);
  if (!publicIp) {
    return jsonGeoResponse(null, null, "none");
  }

  try {
    const res = await fetch(`https://api.country.is/${encodeURIComponent(publicIp)}`, {
      signal: AbortSignal.timeout(GEO_IP_TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return jsonGeoResponse(null, null, "none");
    }

    const payload = (await res.json()) as { country?: unknown };
    const country =
      typeof payload?.country === "string"
        ? payload.country.trim().toUpperCase()
        : null;

    if (!country || !/^[A-Z]{2}$/.test(country)) {
      return jsonGeoResponse(null, null, "none");
    }

    const lang = resolveLangForCountry(country, acceptLanguage);
    return jsonGeoResponse(country, lang, "geoip");
  } catch {
    return jsonGeoResponse(null, null, "none");
  }
}
