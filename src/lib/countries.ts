import type { Lang } from "@/lib/i18n/translations";

/**
 * Countries the platform runs in. Each one has its own database for personal data
 * (see `getCountryDatabase`). To add a country: add its code here, then follow the
 * "Adding a country" section of the README.
 */
export const SUPPORTED_COUNTRIES = ["RO", "AL", "IT", "MD"] as const;
export type CountryCode = (typeof SUPPORTED_COUNTRIES)[number];

export const COUNTRY_INFO: Record<CountryCode, { lang: Lang; center: [number, number] }> = {
  RO: { lang: "ro", center: [44.4268, 26.1025] },
  AL: { lang: "sq", center: [41.3275, 19.8187] },
  IT: { lang: "it", center: [41.9028, 12.4964] },
  MD: { lang: "ro", center: [47.0105, 28.8638] },
};

export const COUNTRY_LABELS: Record<CountryCode, Record<Lang, string>> = {
  RO: { en: "Romania", ro: "România", sq: "Rumania", it: "Romania" },
  AL: { en: "Albania", ro: "Albania", sq: "Shqipëria", it: "Albania" },
  IT: { en: "Italy", ro: "Italia", sq: "Italia", it: "Italia" },
  MD: { en: "Moldova", ro: "Republica Moldova", sq: "Moldavia", it: "Moldavia" },
};

export function isSupportedCountry(value: unknown): value is CountryCode {
  return typeof value === "string" && (SUPPORTED_COUNTRIES as readonly string[]).includes(value);
}

/** Accepts any casing, for values coming from query strings, cookies and form fields. */
export function parseCountry(value: unknown): CountryCode | null {
  const upper = typeof value === "string" ? value.trim().toUpperCase() : "";
  return isSupportedCountry(upper) ? upper : null;
}
