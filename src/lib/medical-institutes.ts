import type { Lang } from "@/lib/i18n/translations";

export const SUPPORTED_COUNTRIES = ["RO", "AL", "IT"] as const;
export type CountryCode = (typeof SUPPORTED_COUNTRIES)[number];

export const INSTITUTE_CATEGORIES = [
  "hospital",
  "clinic",
  "gp",
  "dentist",
  "pharmacy",
  "other",
] as const;
export type InstituteCategory = (typeof INSTITUTE_CATEGORIES)[number];

export const COUNTRY_INFO: Record<
  CountryCode,
  { lang: Lang; center: [number, number] }
> = {
  RO: { lang: "ro", center: [44.4268, 26.1025] },
  AL: { lang: "sq", center: [41.3275, 19.8187] },
  IT: { lang: "it", center: [41.9028, 12.4964] },
};

/** Maps a visitor's (ISO 3166-1) country to the site language spoken there. */
const COUNTRY_TO_LANG: Record<string, Lang> = {
  RO: "ro",
  MD: "ro",
  AL: "sq",
  XK: "sq",
  IT: "it",
  SM: "it",
  VA: "it",
};

const LANG_TO_COUNTRY: Record<Lang, CountryCode> = {
  ro: "RO",
  sq: "AL",
  it: "IT",
  en: "RO",
};

export type MedicalInstitute = {
  id: string;
  country_code: CountryCode;
  name: string;
  category: InstituteCategory;
  address: string | null;
  city: string | null;
  phone: string | null;
  website: string | null;
  hours: string | null;
  emergency: boolean;
  lat: number;
  lng: number;
  distance_km?: number | null;
};

export type AdminMedicalInstitute = MedicalInstitute & {
  is_active: boolean;
  source: "manual" | "osm";
  osm_ref: string | null;
  manually_edited: boolean;
  updated_at: string;
};

export type MedicalInstituteInput = {
  country_code: CountryCode;
  name: string;
  category: InstituteCategory;
  address: string | null;
  city: string | null;
  phone: string | null;
  website: string | null;
  hours: string | null;
  emergency: boolean;
  lat: number;
  lng: number;
  is_active: boolean;
};

export function isSupportedCountry(value: unknown): value is CountryCode {
  return (
    typeof value === "string" &&
    (SUPPORTED_COUNTRIES as readonly string[]).includes(value)
  );
}

export function isInstituteCategory(value: unknown): value is InstituteCategory {
  return (
    typeof value === "string" &&
    (INSTITUTE_CATEGORIES as readonly string[]).includes(value)
  );
}

export function langForCountry(country: string | null | undefined): Lang | null {
  if (!country) return null;
  return COUNTRY_TO_LANG[country.toUpperCase()] ?? null;
}

export function countryForLang(lang: Lang): CountryCode {
  return LANG_TO_COUNTRY[lang] ?? "RO";
}

const COUNTRY_HEADERS = [
  "cf-ipcountry",
  "x-vercel-ip-country",
  "cloudfront-viewer-country",
  "x-country-code",
  "x-geo-country",
];

/** Reads the visitor country injected by the hosting/CDN layer (Cloudflare, Vercel, CloudFront…). */
export function countryFromHeaders(headers: Pick<Headers, "get">): string | null {
  for (const name of COUNTRY_HEADERS) {
    const value = headers.get(name)?.trim().toUpperCase();
    if (value && /^[A-Z]{2}$/.test(value) && value !== "XX" && value !== "T1") {
      return value;
    }
  }
  return null;
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim().replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeWebsite(value: string | null): string | null {
  if (!value) return null;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withProtocol);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export type InstituteValidationResult =
  | { ok: true; value: MedicalInstituteInput }
  | { ok: false; error: string };

export function validateInstituteInput(body: unknown): InstituteValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body." };
  }
  const input = body as Record<string, unknown>;

  const name = cleanText(input.name, 255);
  if (!name) return { ok: false, error: "Name is required." };

  const country = typeof input.country_code === "string" ? input.country_code.toUpperCase() : "";
  if (!isSupportedCountry(country)) {
    return { ok: false, error: "Country must be one of RO, AL, IT." };
  }

  const category = input.category ?? "clinic";
  if (!isInstituteCategory(category)) {
    return { ok: false, error: "Invalid category." };
  }

  const lat = toNumber(input.lat);
  const lng = toNumber(input.lng);
  if (lat == null || lat < -90 || lat > 90 || lng == null || lng < -180 || lng > 180) {
    return { ok: false, error: "Valid latitude and longitude are required." };
  }

  const websiteRaw = cleanText(input.website, 500);
  const website = normalizeWebsite(websiteRaw);
  if (websiteRaw && !website) {
    return { ok: false, error: "Website must be a valid http(s) URL." };
  }

  return {
    ok: true,
    value: {
      country_code: country,
      name,
      category,
      address: cleanText(input.address, 500),
      city: cleanText(input.city, 160),
      phone: cleanText(input.phone, 120),
      website,
      hours: cleanText(input.hours, 255),
      emergency: input.emergency === true || input.emergency === 1 || input.emergency === "1",
      lat: Math.round(lat * 1e6) / 1e6,
      lng: Math.round(lng * 1e6) / 1e6,
      is_active: input.is_active === undefined ? true : input.is_active === true || input.is_active === 1,
    },
  };
}

export function directionsUrl(institute: Pick<MedicalInstitute, "lat" | "lng">) {
  return `https://www.google.com/maps/dir/?api=1&destination=${institute.lat},${institute.lng}`;
}
