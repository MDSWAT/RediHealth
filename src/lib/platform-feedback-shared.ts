import { isSupportedCountry, type CountryCode } from "@/lib/countries";
import { isSupportedLang } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

export const RATING_KEYS = [
  "rating_usefulness",
  "rating_ease_of_use",
  "rating_visual_design",
  "rating_content_clarity",
  "rating_future_use",
] as const;

export type RatingKey = (typeof RATING_KEYS)[number];

export const GENDER_OPTIONS = ["female", "male", "other", "prefer_not_to_say"] as const;
export type FeedbackGender = (typeof GENDER_OPTIONS)[number];

export const AGE_GROUP_OPTIONS = [
  "under_18",
  "18_24",
  "25_34",
  "35_44",
  "45_54",
  "55_64",
  "65_plus",
  "prefer_not_to_say",
] as const;
export type FeedbackAgeGroup = (typeof AGE_GROUP_OPTIONS)[number];

export const MARITAL_STATUS_OPTIONS = [
  "single",
  "married_or_partnered",
  "divorced_or_separated",
  "widowed",
  "prefer_not_to_say",
] as const;
export type FeedbackMaritalStatus = (typeof MARITAL_STATUS_OPTIONS)[number];

export type PlatformFeedbackItem = {
  id: string;
  country_code: CountryCode;
  lang: Lang;
  page_path: string | null;
  rating_usefulness: number;
  rating_ease_of_use: number;
  rating_visual_design: number;
  rating_content_clarity: number;
  rating_future_use: number;
  average_rating: number;
  open_feedback: string | null;
  gender: FeedbackGender | null;
  age_group: FeedbackAgeGroup | null;
  locality: string | null;
  occupation: string | null;
  marital_status: FeedbackMaritalStatus | null;
  anonymized_redactions: number;
  created_at: string;
};

export type RatingDimensionSummary = {
  key: RatingKey;
  average: number;
  distribution: [number, number, number, number, number];
};

export type DemographicBucket = {
  key: string;
  count: number;
  sharePct: number;
};

export type PlatformFeedbackSummary = {
  totalResponses: number;
  overallAverage: number;
  withOpenFeedbackCount: number;
  anonymizedCount: number;
  dimensions: RatingDimensionSummary[];
  demographics: {
    gender: DemographicBucket[];
    ageGroup: DemographicBucket[];
    maritalStatus: DemographicBucket[];
    topLocalities: DemographicBucket[];
    topOccupations: DemographicBucket[];
  };
};

export type ValidatedFeedbackSubmission = {
  country_code: CountryCode;
  lang: Lang;
  page_path: string | null;
  rating_usefulness: number;
  rating_ease_of_use: number;
  rating_visual_design: number;
  rating_content_clarity: number;
  rating_future_use: number;
  open_feedback: string | null;
  gender: FeedbackGender | null;
  age_group: FeedbackAgeGroup | null;
  locality: string | null;
  occupation: string | null;
  marital_status: FeedbackMaritalStatus | null;
  anonymized_redactions: number;
};

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const URL_RE = /\bhttps?:\/\/[^\s<>"]+/gi;
const CNP_RE = /\b[1-9]\d{12}\b/g;
const PHONE_RE = /(?:\+?\d[\d\s().-]{7,}\d)/g;
const STREET_DETAIL_RE = /\b(?:str(?:ada|\.)?|bd(?:ul|\.)?|bulevardul|calea|aleea|nr\.?|numărul|numarul|bl(?:oc|\.)?|sc(?:ara|\.)?|et(?:aj|\.)?|ap(?:artament|\.)?)\s+[a-z0-9ăâîșț.-]+/gi;

/**
 * Scrubs accidental personal identifiers (emails, phone numbers, national IDs, URLs,
 * and street/apartment numbers) before persistence so stored feedback stays anonymous.
 */
export function scrubPersonalIdentifiers(
  raw: string,
  options: { maxLength: number; stripStreetDetails?: boolean },
): { cleaned: string | null; redactions: number } {
  let redactions = 0;
  let value = raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
  if (!value) return { cleaned: null, redactions: 0 };

  const applyRedaction = (pattern: RegExp, replacement: string) => {
    value = value.replace(pattern, () => {
      redactions += 1;
      return replacement;
    });
  };

  applyRedaction(EMAIL_RE, "[date-anonimizate]");
  applyRedaction(CNP_RE, "[date-anonimizate]");
  applyRedaction(PHONE_RE, "[date-anonimizate]");
  applyRedaction(URL_RE, "[link-eliminat]");

  if (options.stripStreetDetails) {
    value = value.replace(STREET_DETAIL_RE, () => {
      redactions += 1;
      return "";
    });
    value = value.replace(/\s*,\s*,+/g, ", ").replace(/^[,\s]+|[,\s]+$/g, "");
  }

  value = value.replace(/\s{2,}/g, " ").trim();
  if (!value) return { cleaned: null, redactions };
  if (value.length > options.maxLength) {
    value = value.slice(0, options.maxLength).trim();
  }
  return { cleaned: value || null, redactions };
}

export function normalizeAgeGroup(input: unknown): FeedbackAgeGroup | null {
  if (input == null || input === "") return null;
  const raw = String(input).trim().toLowerCase();
  if (!raw) return null;
  if ((AGE_GROUP_OPTIONS as readonly string[]).includes(raw)) {
    return raw as FeedbackAgeGroup;
  }
  const numeric = Number.parseInt(raw, 10);
  if (Number.isFinite(numeric) && String(numeric) === raw && numeric >= 10 && numeric <= 120) {
    if (numeric < 18) return "under_18";
    if (numeric <= 24) return "18_24";
    if (numeric <= 34) return "25_34";
    if (numeric <= 44) return "35_44";
    if (numeric <= 54) return "45_54";
    if (numeric <= 64) return "55_64";
    return "65_plus";
  }
  return null;
}

function parseRating(value: unknown): number | null {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(num) || num < 1 || num > 5) return null;
  return num;
}

function sanitizePagePath(input: unknown): string | null {
  if (typeof input !== "string" || !input.trim()) return null;
  try {
    const url = input.startsWith("/") ? new URL(input, "https://redihealth.local") : new URL(input);
    const pathname = url.pathname.replace(/\/patient-portal\/[^/]+/g, "/patient-portal/[token]");
    return pathname.slice(0, 255) || "/";
  } catch {
    return null;
  }
}

export function validateFeedbackPayload(
  payload: unknown,
  fallbackCountry: CountryCode = "RO",
): { ok: true; data: ValidatedFeedbackSubmission } | { ok: false; error: string; code: string } {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "Invalid feedback payload.", code: "invalid_payload" };
  }

  const record = payload as Record<string, unknown>;
  const ratings: Record<RatingKey, number> = {
    rating_usefulness: 0,
    rating_ease_of_use: 0,
    rating_visual_design: 0,
    rating_content_clarity: 0,
    rating_future_use: 0,
  };

  for (const key of RATING_KEYS) {
    const parsed = parseRating(record[key]);
    if (parsed === null) {
      return {
        ok: false,
        error: `Please provide a rating from 1 to 5 for ${key}.`,
        code: "invalid_rating",
      };
    }
    ratings[key] = parsed;
  }

  const rawGender = typeof record.gender === "string" ? record.gender.trim().toLowerCase() : "";
  if (rawGender && !(GENDER_OPTIONS as readonly string[]).includes(rawGender)) {
    return { ok: false, error: "Invalid gender selection.", code: "invalid_gender" };
  }

  const rawMarital = typeof record.marital_status === "string" ? record.marital_status.trim().toLowerCase() : "";
  if (rawMarital && !(MARITAL_STATUS_OPTIONS as readonly string[]).includes(rawMarital)) {
    return { ok: false, error: "Invalid marital status selection.", code: "invalid_marital_status" };
  }

  const hasAgeInput = record.age_group != null && String(record.age_group).trim() !== "";
  const ageGroup = normalizeAgeGroup(record.age_group);
  if (hasAgeInput && !ageGroup) {
    return { ok: false, error: "Invalid age or age group.", code: "invalid_age_group" };
  }

  const rawOpen = typeof record.open_feedback === "string" ? record.open_feedback : "";
  const rawLocality = typeof record.locality === "string" ? record.locality : "";
  const rawOccupation = typeof record.occupation === "string" ? record.occupation : "";

  if (rawOpen.length > 3000 || rawLocality.length > 200 || rawOccupation.length > 200) {
    return { ok: false, error: "One or more text answers exceed the maximum length.", code: "too_long" };
  }

  const openClean = scrubPersonalIdentifiers(rawOpen, { maxLength: 2000, stripStreetDetails: false });
  const localityClean = scrubPersonalIdentifiers(rawLocality, { maxLength: 120, stripStreetDetails: true });
  const occupationClean = scrubPersonalIdentifiers(rawOccupation, { maxLength: 120, stripStreetDetails: true });

  const rawLang = typeof record.lang === "string" ? record.lang.trim().toLowerCase() : "ro";
  const lang: Lang = isSupportedLang(rawLang) ? rawLang : "ro";

  const rawCountry = typeof record.country_code === "string" ? record.country_code.trim().toUpperCase() : "";
  const countryCode: CountryCode = isSupportedCountry(rawCountry) ? rawCountry : fallbackCountry;

  const totalRedactions = Math.min(
    255,
    openClean.redactions + localityClean.redactions + occupationClean.redactions,
  );

  return {
    ok: true,
    data: {
      country_code: countryCode,
      lang,
      page_path: sanitizePagePath(record.page_path),
      ...ratings,
      open_feedback: openClean.cleaned,
      gender: (rawGender as FeedbackGender) || null,
      age_group: ageGroup,
      locality: localityClean.cleaned,
      occupation: occupationClean.cleaned,
      marital_status: (rawMarital as FeedbackMaritalStatus) || null,
      anonymized_redactions: totalRedactions,
    },
  };
}

export function computeFeedbackSummary(items: PlatformFeedbackItem[]): PlatformFeedbackSummary {
  const total = items.length;
  const dimensions: RatingDimensionSummary[] = RATING_KEYS.map((key) => {
    const dist: [number, number, number, number, number] = [0, 0, 0, 0, 0];
    let sum = 0;
    for (const item of items) {
      const score = item[key];
      if (score >= 1 && score <= 5) {
        dist[score - 1] += 1;
        sum += score;
      }
    }
    return {
      key,
      average: total > 0 ? Number((sum / total).toFixed(2)) : 0,
      distribution: dist,
    };
  });

  const overallAverage =
    total > 0
      ? Number((dimensions.reduce((acc, dim) => acc + dim.average, 0) / dimensions.length).toFixed(2))
      : 0;

  const countBuckets = (values: (string | null | undefined)[], limit?: number): DemographicBucket[] => {
    const counts = new Map<string, number>();
    for (const raw of values) {
      const key = raw?.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, limit ?? counts.size);
    return sorted.map(([key, count]) => ({
      key,
      count,
      sharePct: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  };

  return {
    totalResponses: total,
    overallAverage,
    withOpenFeedbackCount: items.filter((item) => Boolean(item.open_feedback?.trim())).length,
    anonymizedCount: items.filter((item) => item.anonymized_redactions > 0).length,
    dimensions,
    demographics: {
      gender: countBuckets(items.map((i) => i.gender)),
      ageGroup: countBuckets(items.map((i) => i.age_group)),
      maritalStatus: countBuckets(items.map((i) => i.marital_status)),
      topLocalities: countBuckets(items.map((i) => i.locality), 8),
      topOccupations: countBuckets(items.map((i) => i.occupation), 8),
    },
  };
}
