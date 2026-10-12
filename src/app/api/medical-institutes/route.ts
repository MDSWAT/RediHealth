import { NextResponse } from "next/server";
import { countryCenter, findNearbyInstitutes } from "@/lib/data/medical-institutes";
import { hasDatabaseConnectionConfig } from "@/lib/database";
import {
  countryFromHeaders,
  isInstituteCategory,
  isSupportedCountry,
  type CountryCode,
} from "@/lib/medical-institutes";

function parseCoordinate(value: string | null, max: number) {
  if (value == null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && Math.abs(parsed) <= max ? parsed : null;
}

/**
 * Public lookup for the "Find help" map.
 * - `lat` + `lng`: nearest institutes to that point (any supported country unless `country` is given).
 * - `country` only: institutes around that country's capital.
 * - neither: country detected from CDN headers, falling back to Romania.
 */
export async function GET(request: Request) {
  if (!hasDatabaseConnectionConfig()) {
    return NextResponse.json({ error: "Directory unavailable." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const lat = parseCoordinate(searchParams.get("lat"), 90);
  const lng = parseCoordinate(searchParams.get("lng"), 180);
  const countryParam = searchParams.get("country")?.toUpperCase() ?? null;
  const categoryParam = searchParams.get("category");
  const search = (searchParams.get("q") || "").trim().slice(0, 100);
  const limit = Number(searchParams.get("limit") || 80);

  let country: CountryCode | null = isSupportedCountry(countryParam) ? countryParam : null;
  if ((lat == null || lng == null) && !country) {
    const detected = countryFromHeaders(request.headers);
    country = isSupportedCountry(detected) ? detected : "RO";
  }

  const center = lat != null && lng != null ? { lat, lng } : countryCenter(country ?? "RO");

  try {
    const institutes = await findNearbyInstitutes({
      lat: center.lat,
      lng: center.lng,
      country,
      category: isInstituteCategory(categoryParam) ? categoryParam : null,
      search,
      limit: Number.isFinite(limit) ? limit : 80,
    });

    return NextResponse.json(
      {
        country: country ?? institutes[0]?.country_code ?? null,
        center,
        institutes,
      },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch (error) {
    console.error("Failed to load medical institutes", error);
    return NextResponse.json(
      { error: "Could not load medical institutes. Ensure migration 007 is applied." },
      { status: 503 },
    );
  }
}
