import { NextResponse } from "next/server";
import { REGIONAL_CITY_PRESETS } from "@/lib/i18n/find-help-translations";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { CountryCode } from "@/lib/medical-institutes";

const VALID_COUNTRIES = new Set<CountryCode>(["RO", "AL", "IT", "MD", "HR"]);

function normalizeSearchToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .toLowerCase()
    .trim();
}

const REGION_ALIASES: Array<{
  tokens: string[];
  lat: number;
  lng: number;
  label: string;
  country: CountryCode;
}> = [
  {
    tokens: ["medimurje", "medjimurje", "cakovec", "medimurska", "medjimurska"],
    lat: 46.3844,
    lng: 16.4339,
    label: "Čakovec",
    country: "HR",
  },
  {
    tokens: ["varazdin", "varazdinska", "varazdin county"],
    lat: 46.3044,
    lng: 16.3378,
    label: "Varaždin",
    country: "HR",
  },
];

function matchLocalPreset(
  query: string,
  preferredCountry?: CountryCode | null,
): { lat: number; lng: number; label: string; country: CountryCode } | null {
  const normalized = normalizeSearchToken(query);
  if (!normalized) return null;

  for (const alias of REGION_ALIASES) {
    if (alias.tokens.some((token) => normalized === token)) {
      return {
        lat: alias.lat,
        lng: alias.lng,
        label: alias.label,
        country: alias.country,
      };
    }
  }

  const orderedCountries: CountryCode[] = preferredCountry
    ? [preferredCountry, ...(Object.keys(REGIONAL_CITY_PRESETS) as CountryCode[]).filter((c) => c !== preferredCountry)]
    : (Object.keys(REGIONAL_CITY_PRESETS) as CountryCode[]);

  for (const country of orderedCountries) {
    const cities = REGIONAL_CITY_PRESETS[country] ?? [];
    for (const city of cities) {
      if (normalizeSearchToken(city.name) === normalized) {
        return { lat: city.lat, lng: city.lng, label: city.name, country };
      }
    }
  }

  return null;
}

export async function GET(request: Request) {
  const rateLimit = await checkRateLimit(`geocode:${getClientIp(request)}`, {
    limit: 20,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many location searches. Wait a moment and try again.", match: null },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  const url = new URL(request.url);
  const rawQuery = url.searchParams.get("q")?.trim() ?? "";
  const rawCountry = url.searchParams.get("country")?.trim().toUpperCase() ?? "";
  const country = VALID_COUNTRIES.has(rawCountry as CountryCode)
    ? (rawCountry as CountryCode)
    : null;

  if (!rawQuery) {
    return NextResponse.json({ match: null }, { status: 400 });
  }
  if (rawQuery.length > 160) {
    return NextResponse.json({ match: null }, { status: 400 });
  }

  const preset = matchLocalPreset(rawQuery, country);
  if (preset) {
    return NextResponse.json({
      match: { ...preset, kind: "preset" },
    });
  }

  try {
    const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
    nominatimUrl.searchParams.set("format", "jsonv2");
    nominatimUrl.searchParams.set("limit", "1");
    nominatimUrl.searchParams.set("addressdetails", "1");
    nominatimUrl.searchParams.set("q", rawQuery);
    if (country) {
      nominatimUrl.searchParams.set("countrycodes", country.toLowerCase());
    }

    const upstream = await fetch(nominatimUrl.toString(), {
      headers: {
        "User-Agent": "RediHealth/1.0 (+https://redihealth.org)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json({ match: null });
    }

    const items = (await upstream.json()) as Array<{
      lat?: string;
      lon?: string;
      display_name?: string;
      address?: { country_code?: string };
    }>;
    const first = items[0];
    if (!first?.lat || !first?.lon) {
      return NextResponse.json({ match: null });
    }

    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ match: null });
    }

    const detectedCode = first.address?.country_code?.toUpperCase();
    const resolvedCountry =
      detectedCode && VALID_COUNTRIES.has(detectedCode as CountryCode)
        ? (detectedCode as CountryCode)
        : country ?? undefined;

    const shortLabel =
      typeof first.display_name === "string"
        ? first.display_name.split(",").slice(0, 2).join(", ").trim() || rawQuery
        : rawQuery;

    return NextResponse.json({
      match: {
        lat,
        lng,
        label: shortLabel,
        ...(resolvedCountry ? { country: resolvedCountry } : {}),
        kind: "address",
      },
    });
  } catch {
    return NextResponse.json({ match: null });
  }
}
