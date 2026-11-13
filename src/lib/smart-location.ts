import { isSupportedLang } from "@/lib/i18n/routing";
import { REGIONAL_CITY_PRESETS } from "@/lib/i18n/find-help-translations";
import type { Lang } from "@/lib/i18n/translations";
import { isSupportedCountry, type CountryCode } from "@/lib/medical-institutes";

export type SmartCityOption = {
  name: string;
  lat: number;
  lng: number;
  country: CountryCode;
};

export type SavedFindHelpLocation = (
  | {
      mode: "city";
      country: CountryCode;
      cityName: string;
      lat: number;
      lng: number;
    }
  | {
      mode: "country";
      country: CountryCode;
    }
) & {
  chosenOnLang: Lang;
};

export type SmartLocationResolution = {
  mode: "city" | "country";
  country: CountryCode;
  city: SmartCityOption | null;
  reason: "saved" | "region" | "language";
  suggestions: SmartCityOption[];
};

export type ResolveSmartLocationInput = {
  lang: Lang;
  ipCountry?: string | null;
  timeZone?: string | null;
  browserLocales?: readonly (string | null | undefined)[] | null;
  savedChoice?: SavedFindHelpLocation | null;
};

export const FIND_HELP_LOCATION_STORAGE_KEY = "redihealth.findHelpLocation.v1";

const TIMEZONE_TO_COUNTRY: Record<string, CountryCode> = {
  "Europe/Bucharest": "RO",
  "Europe/Chisinau": "MD",
  "Europe/Tiraspol": "MD",
  "Europe/Tirane": "AL",
  "Europe/Rome": "IT",
  "Europe/Vatican": "IT",
  "Europe/San_Marino": "IT",
  "Europe/Zagreb": "HR",
};

const REGION_TO_COUNTRY: Record<string, CountryCode> = {
  RO: "RO",
  MD: "MD",
  AL: "AL",
  XK: "AL",
  IT: "IT",
  SM: "IT",
  VA: "IT",
  HR: "HR",
};

const PRIMARY_LANG_TO_COUNTRY: Record<string, CountryCode> = {
  sq: "AL",
  it: "IT",
  hr: "HR",
  ro: "RO",
  ru: "MD",
};

const PARTNER_CAPITALS_ORDER: readonly CountryCode[] = ["RO", "IT", "HR", "AL", "MD"];

function cityPresetToOption(country: CountryCode, index = 0): SmartCityOption {
  const presets = REGIONAL_CITY_PRESETS[country];
  const preset = presets[index] ?? presets[0];
  return { name: preset.name, lat: preset.lat, lng: preset.lng, country };
}

function findPresetByName(country: CountryCode, name: string): SmartCityOption | null {
  const match = REGIONAL_CITY_PRESETS[country].find((city) => city.name === name);
  return match ? { name: match.name, lat: match.lat, lng: match.lng, country } : null;
}

function extractLocaleParts(rawLocale: string | null | undefined): {
  primaryLang: string | null;
  region: string | null;
} {
  if (!rawLocale || typeof rawLocale !== "string") {
    return { primaryLang: null, region: null };
  }
  const normalized = rawLocale.trim().replace(/_/g, "-");
  if (!normalized) return { primaryLang: null, region: null };

  const segments = normalized.split("-").filter(Boolean);
  const primaryLang = segments[0] && /^[A-Za-z]{2,3}$/.test(segments[0]) ? segments[0].toLowerCase() : null;

  let region: string | null = null;
  for (let i = 1; i < segments.length; i += 1) {
    const seg = segments[i];
    if (seg === "u" || seg === "t" || seg === "x") break;
    if (/^[A-Za-z]{2}$/.test(seg)) {
      region = seg.toUpperCase();
      break;
    }
  }

  return { primaryLang, region };
}

function hasMoldovaRegionSubtag(locales: readonly (string | null | undefined)[] | null | undefined): boolean {
  if (!locales) return false;
  for (const locale of locales) {
    const { region } = extractLocaleParts(locale);
    if (region === "MD") return true;
  }
  return false;
}

export function inferCountryFromTimeZone(timeZone: string | null | undefined): CountryCode | null {
  if (!timeZone || typeof timeZone !== "string") return null;
  return TIMEZONE_TO_COUNTRY[timeZone.trim()] ?? null;
}

export function inferCountryFromBrowserLocales(
  locales: readonly (string | null | undefined)[] | null | undefined,
): CountryCode | null {
  if (!locales || locales.length === 0) return null;

  for (const locale of locales) {
    const { region } = extractLocaleParts(locale);
    if (region && REGION_TO_COUNTRY[region]) {
      return REGION_TO_COUNTRY[region];
    }
  }

  for (const locale of locales) {
    const { primaryLang } = extractLocaleParts(locale);
    if (primaryLang && PRIMARY_LANG_TO_COUNTRY[primaryLang]) {
      return PRIMARY_LANG_TO_COUNTRY[primaryLang];
    }
  }

  return null;
}

export function validateSavedFindHelpLocation(raw: unknown): SavedFindHelpLocation | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Record<string, unknown>;
  const chosenOnLang = candidate.chosenOnLang;
  if (typeof chosenOnLang !== "string" || !isSupportedLang(chosenOnLang)) return null;

  const country = typeof candidate.country === "string" ? candidate.country.toUpperCase() : "";
  if (!isSupportedCountry(country)) return null;

  if (candidate.mode === "country") {
    return { mode: "country", country, chosenOnLang };
  }

  if (candidate.mode === "city") {
    const cityName = typeof candidate.cityName === "string" ? candidate.cityName.trim() : "";
    const lat = candidate.lat;
    const lng = candidate.lng;
    if (
      !cityName ||
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return null;
    }
    return { mode: "city", country, cityName, lat, lng, chosenOnLang };
  }

  return null;
}

export function readSavedFindHelpLocation(
  storage?: Pick<Storage, "getItem"> | null,
): SavedFindHelpLocation | null {
  try {
    const target = storage ?? (typeof window !== "undefined" ? window.localStorage : null);
    if (!target) return null;
    const raw = target.getItem(FIND_HELP_LOCATION_STORAGE_KEY);
    if (!raw) return null;
    return validateSavedFindHelpLocation(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeSavedFindHelpLocation(
  value: SavedFindHelpLocation,
  storage?: Pick<Storage, "setItem"> | null,
): void {
  try {
    const validated = validateSavedFindHelpLocation(value);
    if (!validated) return;
    const target = storage ?? (typeof window !== "undefined" ? window.localStorage : null);
    if (!target) return;
    target.setItem(FIND_HELP_LOCATION_STORAGE_KEY, JSON.stringify(validated));
  } catch {
    // Ignore quota or storage restriction errors.
  }
}

export function resolveSmartLocation({
  lang,
  ipCountry,
  timeZone,
  browserLocales,
  savedChoice,
}: ResolveSmartLocationInput): SmartLocationResolution {
  const validSaved = validateSavedFindHelpLocation(savedChoice);
  const normalizedIp = typeof ipCountry === "string" ? ipCountry.trim().toUpperCase() : "";
  const validIpCountry: CountryCode | null = isSupportedCountry(normalizedIp) ? normalizedIp : null;
  const tzCountry = inferCountryFromTimeZone(timeZone);
  const localeCountry = inferCountryFromBrowserLocales(browserLocales);
  const ambientCountry = validIpCountry ?? tzCountry ?? localeCountry;

  let mode: "city" | "country";
  let country: CountryCode;
  let city: SmartCityOption | null;
  let reason: "saved" | "region" | "language";

  if (validSaved && (validSaved.chosenOnLang === lang || lang === "en" || lang === "rom")) {
    mode = validSaved.mode;
    country = validSaved.country;
    city =
      validSaved.mode === "city"
        ? {
            name: validSaved.cityName,
            lat: validSaved.lat,
            lng: validSaved.lng,
            country: validSaved.country,
          }
        : null;
    reason = "saved";
  } else {
    mode = "city";
    switch (lang) {
      case "ro": {
        if (validIpCountry === "MD" || tzCountry === "MD" || hasMoldovaRegionSubtag(browserLocales)) {
          country = "MD";
          city = cityPresetToOption("MD", 0);
          reason = "region";
        } else {
          country = "RO";
          city = cityPresetToOption("RO", 0);
          reason = validIpCountry === "RO" ? "region" : "language";
        }
        break;
      }
      case "sq":
        country = "AL";
        city = cityPresetToOption("AL", 0);
        reason = "language";
        break;
      case "it":
        country = "IT";
        city = cityPresetToOption("IT", 0);
        reason = "language";
        break;
      case "hr":
        country = "HR";
        city = cityPresetToOption("HR", 0);
        reason = "language";
        break;
      case "ru":
        country = "MD";
        city = cityPresetToOption("MD", 0);
        reason = "language";
        break;
      case "en":
      case "rom":
      default:
        if (ambientCountry) {
          country = ambientCountry;
          city = cityPresetToOption(ambientCountry, 0);
          reason = "region";
        } else {
          country = "RO";
          city = cityPresetToOption("RO", 0);
          reason = "language";
        }
        break;
    }
  }

  const suggestions: SmartCityOption[] = [];
  const seenKeys = new Set<string>();
  const pushUnique = (option: SmartCityOption | null) => {
    if (!option || suggestions.length >= 5) return;
    const key = `${option.country}:${option.name.toLowerCase()}`;
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    suggestions.push(option);
  };

  if (mode === "city" && city) {
    pushUnique(city);
  }

  if (ambientCountry && ambientCountry !== country) {
    pushUnique(cityPresetToOption(ambientCountry, 0));
  }

  if (validSaved) {
    pushUnique(
      validSaved.mode === "city"
        ? {
            name: validSaved.cityName,
            lat: validSaved.lat,
            lng: validSaved.lng,
            country: validSaved.country,
          }
        : cityPresetToOption(validSaved.country, 0),
    );
  }

  if (lang === "ro" && country === "RO") {
    for (const cityName of ["București", "Cluj-Napoca", "Timișoara", "Iași"]) {
      pushUnique(findPresetByName("RO", cityName));
    }
    pushUnique(findPresetByName("MD", "Chișinău"));
  } else if (lang === "ro" && country === "MD") {
    for (const cityName of ["Chișinău", "Bălți", "Cahul"]) {
      pushUnique(findPresetByName("MD", cityName));
    }
    pushUnique(findPresetByName("RO", "București"));
    pushUnique(findPresetByName("RO", "Iași"));
  } else if ((lang === "en" || lang === "rom") && ambientCountry === null && (!validSaved || validSaved.country === country)) {
    for (const capitalCountry of PARTNER_CAPITALS_ORDER) {
      pushUnique(cityPresetToOption(capitalCountry, 0));
    }
  } else {
    for (const preset of REGIONAL_CITY_PRESETS[country]) {
      pushUnique({ name: preset.name, lat: preset.lat, lng: preset.lng, country });
    }
    if (lang === "ru" && country === "MD") {
      pushUnique(findPresetByName("RO", "București"));
    }
  }

  // Always top up up to 5 from active country presets or partner capitals if needed.
  for (const preset of REGIONAL_CITY_PRESETS[country]) {
    pushUnique({ name: preset.name, lat: preset.lat, lng: preset.lng, country });
  }
  for (const partnerCountry of PARTNER_CAPITALS_ORDER) {
    pushUnique(cityPresetToOption(partnerCountry, 0));
  }

  return {
    mode,
    country,
    city,
    reason,
    suggestions,
  };
}
