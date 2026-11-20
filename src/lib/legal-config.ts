import type { Lang } from "@/lib/i18n/languages";

export const LEGAL_VERSION = "0.1";
export const LEGAL_EFFECTIVE_DATE_ISO = "2026-11-19";

export const LEGAL_EFFECTIVE_DATE: Record<Lang, string> = {
  ro: "19 noiembrie 2026",
  en: "19 November 2026",
  sq: "19 nëntor 2026",
  it: "19 novembre 2026",
  hr: "19. studenoga 2026.",
  rom: "19 noyembro 2026",
  ru: "19 ноября 2026 г.",
};

const rawPixelId = (process.env.NEXT_PUBLIC_META_PIXEL_ID || "2195130208072639").trim();
export const META_PIXEL_ID = /^\d{5,24}$/.test(rawPixelId) ? rawPixelId : "";

const contactEmail = (process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@redi.healthcare").trim();
const privacyEmail = (process.env.NEXT_PUBLIC_PRIVACY_EMAIL || "privacy@redi.healthcare").trim();

export const LEGAL_OPERATOR = {
  name: "REDI International",
  streetAddress: "44 Avenue des Jardins",
  cityCountry: {
    ro: "Bruxelles, Belgia",
    en: "Brussels, Belgium",
    sq: "Bruksel, Belgjikë",
    it: "Bruxelles, Belgio",
    hr: "Bruxelles, Belgija",
    rom: "Bruksel, Belgiya",
    ru: "Брюссель, Бельгия",
  } satisfies Record<Lang, string>,
  bceNumber: "0787330885",
  websiteUrl: "https://www.redi-ngo.eu/",
  websiteLabel: "redi-ngo.eu",
  platformDomain: "redi.healthcare",
  contactEmail,
  privacyEmail,
} as const;

export function getOperatorFullAddress(lang: Lang): string {
  const cityCountry = LEGAL_OPERATOR.cityCountry[lang] ?? LEGAL_OPERATOR.cityCountry.en;
  return `${LEGAL_OPERATOR.streetAddress}, ${cityCountry}`;
}
