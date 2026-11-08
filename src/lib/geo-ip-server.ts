import { isRomanianCounty } from "@/lib/romanian-counties";

export const DEFAULT_COUNTY = "București";
export const USER_COUNTY_COOKIE = "redi_user_county";
export const USER_COUNTY_HEADER = "x-user-county";
export const REDIHEALTH_COUNTY_HEADER = "x-redihealth-county";

// Mapping ISO-3166-2:RO county codes (e.g. from Vercel / Cloudflare) to standard Romanian counties
const REGION_CODE_TO_COUNTY: Record<string, string> = {
  AB: "Alba",
  AR: "Arad",
  AG: "Argeș",
  BC: "Bacău",
  BH: "Bihor",
  BN: "Bistrița-Năsăud",
  BT: "Botoșani",
  BR: "Brăila",
  BV: "Brașov",
  B: "București",
  BZ: "Buzău",
  CS: "Caraș-Severin",
  CL: "Călărași",
  CJ: "Cluj",
  CT: "Constanța",
  CV: "Covasna",
  DB: "Dâmbovița",
  DJ: "Dolj",
  GL: "Galați",
  GR: "Giurgiu",
  GJ: "Gorj",
  HR: "Harghita",
  HD: "Hunedoara",
  IL: "Ialomița",
  IS: "Iași",
  IF: "Ilfov",
  MM: "Maramureș",
  MH: "Mehedinți",
  MS: "Mureș",
  NT: "Neamț",
  OT: "Olt",
  PH: "Prahova",
  SJ: "Sălaj",
  SM: "Satu Mare",
  SB: "Sibiu",
  SV: "Suceava",
  TR: "Teleorman",
  TM: "Timiș",
  TL: "Tulcea",
  VS: "Vaslui",
  VL: "Vâlcea",
  VN: "Vrancea",
};

/**
 * Server-safe helper to parse county from cookies or CDN headers
 */
export function resolveCountyFromHeaders(headers: Headers, cookieString?: string): string {
  // 1. Manual user override in cookie
  if (cookieString) {
    const match = cookieString.match(new RegExp(`(?:^|;\\s*)${USER_COUNTY_COOKIE}=([^;]+)`));
    if (match) {
      const decoded = decodeURIComponent(match[1]);
      if (isRomanianCounty(decoded)) {
        return decoded;
      }
    }
  }

  // 2. Region header from Vercel or Cloudflare (e.g. "x-vercel-ip-country-region: IS" or "RO-IS")
  const regionRaw =
    headers.get("x-vercel-ip-country-region") ||
    headers.get("cf-region-code") ||
    headers.get("x-country-region");

  if (regionRaw) {
    const cleanCode = regionRaw.replace(/^RO-/, "").trim().toUpperCase();
    if (REGION_CODE_TO_COUNTY[cleanCode]) {
      return REGION_CODE_TO_COUNTY[cleanCode];
    }
  }

  // 3. Directly check x-user-county if forwarded
  const forwardedRaw = headers.get(USER_COUNTY_HEADER) || headers.get(REDIHEALTH_COUNTY_HEADER);
  if (forwardedRaw) {
    try {
      const forwardedCounty = decodeURIComponent(forwardedRaw);
      if (isRomanianCounty(forwardedCounty)) {
        return forwardedCounty;
      }
    } catch {
      if (isRomanianCounty(forwardedRaw)) {
        return forwardedRaw;
      }
    }
  }

  return DEFAULT_COUNTY;
}
