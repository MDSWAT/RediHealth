import type { Lang } from "@/lib/i18n/translations";
import { COUNTRY_INFO, SUPPORTED_COUNTRIES, isSupportedCountry, type CountryCode } from "@/lib/countries";

export { COUNTRY_INFO, SUPPORTED_COUNTRIES, isSupportedCountry };
export type { CountryCode };

export const INSTITUTE_CATEGORIES = [
  "hospital",
  "clinic",
  "gp",
  "dentist",
  "pharmacy",
  "other",
] as const;
export type InstituteCategory = (typeof INSTITUTE_CATEGORIES)[number];

/** Maps a visitor's (ISO 3166-1) country to the site language spoken there. */
const COUNTRY_TO_LANG: Record<string, Lang> = {
  RO: "ro",
  MD: "ro",
  AL: "sq",
  XK: "sq",
  IT: "it",
  SM: "it",
  VA: "it",
  HR: "hr",
};

const LANG_TO_COUNTRY: Record<Lang, CountryCode> = {
  ro: "RO",
  sq: "AL",
  it: "IT",
  hr: "HR",
  rom: "RO",
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

export function normalizeInstituteWebsite(value: string | null): string | null {
  if (!value) return null;
  const compact = value.trim().replace(/^(https?:\/\/)\s+/i, "$1");
  if (!compact || /\s/.test(compact)) return null;
  const withProtocol = /^https?:\/\//i.test(compact) ? compact : `https://${compact}`;
  // Reject bare email addresses (e.g. "office@clinic.ro" or "http://office@clinic.ro").
  const hostPart = withProtocol.replace(/^https?:\/\//i, "").split("/")[0] ?? "";
  if (!hostPart || hostPart.includes("@") || !/\.[a-z]{2,}$/i.test(hostPart.split(":")[0] ?? "")) {
    return null;
  }
  try {
    const url = new URL(withProtocol);
    if (url.username || url.password) return null;
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

const DIAL_CODE_FIXES: Partial<Record<string, [RegExp, string][]>> = {
  RO: [
    [/^\+4\s+(?=0?[237]\d)/, "+40 "],
    [/^\+0(?=[237]\d)/, "+40 "],
  ],
  MD: [[/^\+37\s+3/, "+373 "]],
  HR: [[/^\+38\s+5/, "+385 "]],
  AL: [[/^\+35\s+5/, "+355 "]],
};

/**
 * Normalizes OpenStreetMap and admin phone numbers.
 * - Converts leading `00` international prefixes (`00385…`, `0040…`, `0039…`) to `+`.
 * - Fixes common OSM country-code spacing typos (e.g. `+4 021…` -> `+40 021…`, `+38 5…` -> `+385 …`).
 * - Puts Italian phone numbers into international form (+39), including mistyped codes in front
 *   of an Italian leading `0` ("+93 06 491813" -> "+39 06 491813").
 */
export function normalizeInstitutePhone(phone: string | null, country: string): string | null {
  if (!phone) return null;
  const cleaned = phone.trim().replace(/\s+/g, " ");
  if (!cleaned) return null;
  const upper = country.toUpperCase();

  return cleaned
    .split(/\s*[;,]\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      let number = part.replace(/^00(?=[1-9]\d)/, "+");
      for (const [pattern, replacement] of DIAL_CODE_FIXES[upper] ?? []) {
        number = number.replace(pattern, replacement);
      }
      if (upper !== "IT") return number;
      if (number.startsWith("+39")) return number;
      if (/^\+\d{1,3}[\s.-]*0/.test(number)) return number.replace(/^\+\d{1,3}[\s.-]*(?=0)/, "+39 ");
      if (/^[03]\d/.test(number)) return `+39 ${number}`;
      return number;
    })
    .join("; ");
}

/** Builds a safe `tel:` href using only the first phone number when multiple numbers are listed. */
export function primaryPhoneHref(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const first = phone.split(/[;,]/)[0]?.trim();
  if (!first) return null;
  const cleaned = first.replace(/(?!^\+)[^\d]/g, "");
  const digitsOnly = cleaned.replace(/\D/g, "");
  return digitsOnly.length >= 3 ? `tel:${cleaned}` : null;
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
    return { ok: false, error: `Country must be one of ${SUPPORTED_COUNTRIES.join(", ")}.` };
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
  const website = normalizeInstituteWebsite(websiteRaw);
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
      phone: normalizeInstitutePhone(cleanText(input.phone, 120), country),
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
