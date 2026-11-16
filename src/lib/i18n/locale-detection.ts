import { DEFAULT_LANG, LOCALE_COOKIE, isSupportedLang } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { countryFromHeaders, langForCountry } from "@/lib/medical-institutes";

export const LOCALE_MANUAL_COOKIE = "redihealth-lang-manual";
export const LOCALE_CHECKED_STORAGE_KEY = "redihealth-locale-checked";

const TIMEZONE_TO_LANG: Record<string, Lang> = {
  "europe/bucharest": "ro",
  "europe/chisinau": "ro",
  "europe/tiraspol": "ro",
  "europe/tirane": "sq",
  "europe/rome": "it",
  "europe/vatican": "it",
  "europe/san_marino": "it",
  "europe/zagreb": "hr",
  "europe/moscow": "ru",
  "europe/kaliningrad": "ru",
  "europe/samara": "ru",
  "europe/yekaterinburg": "ru",
  "europe/minsk": "ru",
};

const TIMEZONE_HEADERS = [
  "x-vercel-ip-timezone",
  "cf-timezone",
  "x-timezone",
] as const;

const AUTOMATED_UA_PATTERN =
  /bot|crawl|spider|slurp|lighthouse|chrome-lighthouse|pagespeed|gtmetrix|headless|prerender|facebookexternalhit|whatsapp|telegrambot/i;

const SECONDARY_TARGET_MIN_Q = 0.5;

type ParsedAcceptTag = {
  tag: string;
  primary: string;
  q: number;
  index: number;
};

/** Maps an IANA timezone name to a RediHealth site language when unambiguous. */
export function langFromTimezone(tz: string | null | undefined): Lang | null {
  if (!tz) return null;
  const normalized = tz.trim().toLowerCase();
  if (!normalized) return null;
  return TIMEZONE_TO_LANG[normalized] ?? null;
}

/** Reads the visitor timezone injected by Vercel, Cloudflare, or an upstream proxy. */
export function timezoneFromHeaders(headers: Pick<Headers, "get">): string | null {
  for (const name of TIMEZONE_HEADERS) {
    const value = headers.get(name)?.trim();
    if (value) return value;
  }
  return null;
}

function extractRegionSubtag(subtags: string[]): string | null {
  for (let i = 1; i < subtags.length; i += 1) {
    const subtag = subtags[i];
    // A single-character subtag starts a BCP-47 extension or private-use section.
    if (subtag.length === 1) break;
    if (/^[a-z]{2}$/.test(subtag)) {
      return subtag.toUpperCase();
    }
  }
  return null;
}

function resolveLanguageTag(rawTag: string): Lang | null {
  const normalized = rawTag.trim().toLowerCase().replace(/_/g, "-");
  if (!normalized || normalized === "*") return null;

  const subtags = normalized.split("-").filter(Boolean);
  const primary = subtags[0];
  if (!primary) return null;

  if (primary === "rmy" || primary === "rom") {
    return "rom";
  }

  if (primary === "en") {
    const region = extractRegionSubtag(subtags);
    if (region) {
      const regionLang = langForCountry(region);
      if (regionLang) return regionLang;
    }
    return "en";
  }

  return isSupportedLang(primary) ? primary : null;
}

function parseQualityValue(params: string[]): number | null {
  let q = 1;
  for (const param of params) {
    const match = param.trim().match(/^q\s*=\s*(.+)$/i);
    if (!match) continue;
    const parsed = Number(match[1].trim());
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
      return null;
    }
    q = parsed;
  }
  return q;
}

function parseAcceptLanguage(header: string | null | undefined): ParsedAcceptTag[] {
  if (!header) return [];

  const entries: ParsedAcceptTag[] = [];
  const parts = header.split(",");

  for (let index = 0; index < parts.length; index += 1) {
    const segments = parts[index].split(";");
    const tag = segments[0]?.trim().toLowerCase().replace(/_/g, "-") ?? "";
    if (!tag) continue;

    const q = parseQualityValue(segments.slice(1));
    if (q === null || q <= 0) continue;

    const primary = tag.split("-")[0] ?? "";
    if (!primary) continue;

    entries.push({ tag, primary, q, index });
  }

  entries.sort((a, b) => b.q - a.q || a.index - b.index);
  return entries;
}

/**
 * Parses an HTTP `Accept-Language` header, honoring quality weights, Romani tags,
 * English regional tags (`en-RO`, `en-IT`, ...), and secondary local languages when
 * generic English sits at the top.
 */
export function langFromAcceptLanguage(header: string | null | undefined): Lang | null {
  const entries = parseAcceptLanguage(header);
  if (entries.length === 0) return null;

  const candidates: Array<{ lang: Lang; q: number }> = [];
  for (const entry of entries) {
    const lang = resolveLanguageTag(entry.tag);
    if (lang) {
      candidates.push({ lang, q: entry.q });
    }
  }

  if (candidates.length === 0) return null;

  const top = candidates[0];
  if (top.lang !== "en") {
    return top.lang;
  }

  const secondaryLocal = candidates.find(
    (candidate) => candidate.lang !== "en" && candidate.q >= SECONDARY_TARGET_MIN_Q,
  );
  return secondaryLocal ? secondaryLocal.lang : "en";
}

/**
 * Maps an ISO country code to a site language, applying Moldova's `ru` vs `ro`
 * preference when `Accept-Language` is supplied.
 */
export function resolveLangForCountry(
  country: string | null | undefined,
  acceptLanguage?: string | null,
): Lang | null {
  if (!country) return null;
  const upper = country.trim().toUpperCase();
  const mapped = langForCountry(upper);
  if (!mapped) return null;

  if (upper === "MD") {
    const entries = parseAcceptLanguage(acceptLanguage);
    let maxRuQ = 0;
    let maxRoQ = 0;
    for (const entry of entries) {
      if (entry.primary === "ru" && entry.q > maxRuQ) maxRuQ = entry.q;
      if (entry.primary === "ro" && entry.q > maxRoQ) maxRoQ = entry.q;
    }
    if (maxRuQ > 0 && (maxRoQ === 0 || maxRuQ > maxRoQ)) {
      return "ru";
    }
    return "ro";
  }

  return mapped;
}

/**
 * Resolves the visitor's preferred locale for an incoming server request while
 * giving explicit manual choices top priority and Geo-IP / timezone priority over
 * stale automatic cookies.
 */
export function detectPreferredLocaleFromRequest({
  cookies,
  headers,
}: {
  cookies: { get(name: string): { value: string } | undefined };
  headers: Pick<Headers, "get">;
}): Lang {
  const cookieLang = cookies.get(LOCALE_COOKIE)?.value;
  const hasManualOverride = cookies.get(LOCALE_MANUAL_COOKIE)?.value === "1";

  if (hasManualOverride && cookieLang && isSupportedLang(cookieLang)) {
    return cookieLang;
  }

  const acceptLanguage = headers.get("accept-language");
  const countryLang = resolveLangForCountry(countryFromHeaders(headers), acceptLanguage);
  if (countryLang) {
    return countryLang;
  }

  const timezoneLang = langFromTimezone(timezoneFromHeaders(headers));
  if (timezoneLang) {
    return timezoneLang;
  }

  if (cookieLang && isSupportedLang(cookieLang)) {
    return cookieLang;
  }

  return langFromAcceptLanguage(acceptLanguage) ?? DEFAULT_LANG;
}

/**
 * Resolves the preferred locale from browser `navigator.languages` and IANA timezone.
 * Honors an explicit non-English primary tag first, then timezone (for local users on an
 * English OS/browser), then any secondary regional or target language tag.
 */
export function detectClientPreferredLocale({
  languages,
  timeZone,
}: {
  languages?: readonly string[] | null;
  timeZone?: string | null;
} = {}): Lang | null {
  const cleaned = (languages ?? []).map((item) => item.trim()).filter(Boolean);
  const resolved = cleaned
    .map((tag) => resolveLanguageTag(tag))
    .filter((lang): lang is Lang => lang !== null);

  if (resolved.length > 0 && resolved[0] !== "en") {
    return resolved[0];
  }

  const timezoneLang = langFromTimezone(timeZone);
  if (timezoneLang && timezoneLang !== "en") {
    return timezoneLang;
  }

  const secondaryLocal = resolved.find((lang) => lang !== "en");
  if (secondaryLocal) {
    return secondaryLocal;
  }

  return resolved.includes("en") ? "en" : null;
}

/** Returns true for crawlers, headless browsers, and Lighthouse/audit runners. */
export function isAutomatedOrAuditUserAgent(
  userAgent: string | null | undefined,
  webdriver?: boolean,
): boolean {
  if (webdriver) return true;
  if (!userAgent) return false;
  return AUTOMATED_UA_PATTERN.test(userAgent);
}

/** Checks whether the manual-locale override cookie is present in a cookie header or `document.cookie`. */
export function hasManualLocaleCookie(cookieString: string | null | undefined): boolean {
  if (!cookieString) return false;
  return cookieString
    .split(";")
    .some((part) => part.trim() === `${LOCALE_MANUAL_COOKIE}=1`);
}

/** Persists the visitor's explicit manual language switch so auto-detection will not override it. */
export function markManualLocaleSelection(): void {
  if (typeof document !== "undefined") {
    document.cookie = `${LOCALE_MANUAL_COOKIE}=1; path=/; max-age=31536000; samesite=lax`;
  }
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(LOCALE_CHECKED_STORAGE_KEY, "1");
    } catch {
      // Ignore storage failures in restricted browsing contexts.
    }
  }
}
