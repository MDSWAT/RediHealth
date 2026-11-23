/**
 * Rules for tagged ad links (utm_source / utm_medium / utm_campaign / utm_content), shared by the
 * link generator in the panel, the API that saves links and the tests. The server rebuilds every
 * saved URL from these fields, so only links to our own pages can be stored.
 */
import { isSupportedLang } from "@/lib/i18n/routing";

export const CAMPAIGN_SITE = "https://redi.healthcare";

export const LANDING_PAGES = [
  "/",
  "/get-help",
  "/find-help",
  "/health-assistant",
  "/health-information",
  "/mediatori",
  "/health-check",
  "/prescription-review",
  "/about",
] as const;
export type LandingPage = (typeof LANDING_PAGES)[number];

export type AdType = "paid" | "free";
export type PlatformKind = "social" | "search" | "messaging" | "email" | "sms" | "print" | "custom";
export type Platform = { id: string; label: string; source: string; kind: PlatformKind };

/** Built-in places to publish. Email, SMS and print get a translated label in the panel. */
export const PLATFORMS: Platform[] = [
  { id: "facebook", label: "Facebook", source: "facebook", kind: "social" },
  { id: "instagram", label: "Instagram", source: "instagram", kind: "social" },
  { id: "google", label: "Google", source: "google", kind: "search" },
  { id: "tiktok", label: "TikTok", source: "tiktok", kind: "social" },
  { id: "youtube", label: "YouTube", source: "youtube", kind: "social" },
  { id: "whatsapp", label: "WhatsApp", source: "whatsapp", kind: "messaging" },
  { id: "telegram", label: "Telegram", source: "telegram", kind: "messaging" },
  { id: "linkedin", label: "LinkedIn", source: "linkedin", kind: "social" },
  { id: "x", label: "X", source: "x", kind: "social" },
  { id: "email", label: "Email", source: "newsletter", kind: "email" },
  { id: "sms", label: "SMS", source: "sms", kind: "sms" },
  { id: "print", label: "Poster / QR", source: "poster", kind: "print" },
];

export const MEDIUMS = ["paid_social", "social", "cpc", "organic", "messaging", "email", "sms", "print", "paid", "referral"] as const;
export type Medium = (typeof MEDIUMS)[number];

/** Lower-case, no diacritics, words joined by "-": what the statistics group by. */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** The utm_medium for a platform, following the usual naming so reports stay comparable. */
export function mediumFor(kind: PlatformKind, adType: AdType): Medium {
  switch (kind) {
    case "social":
      return adType === "paid" ? "paid_social" : "social";
    case "search":
      return adType === "paid" ? "cpc" : "organic";
    case "messaging":
      return "messaging";
    case "email":
      return "email";
    case "sms":
      return "sms";
    case "print":
      return "print";
    default:
      return adType === "paid" ? "paid" : "referral";
  }
}

export type CampaignLinkFields = {
  lang: string;
  path: string;
  source: string;
  medium: string;
  campaign: string;
  content?: string | null;
};

export function buildCampaignLink(fields: CampaignLinkFields): string {
  const url = new URL(`${CAMPAIGN_SITE}/${fields.lang}${fields.path === "/" ? "" : fields.path}`);
  url.searchParams.set("utm_source", fields.source);
  url.searchParams.set("utm_medium", fields.medium);
  url.searchParams.set("utm_campaign", fields.campaign);
  if (fields.content) url.searchParams.set("utm_content", fields.content);
  return url.toString();
}

export type CampaignLinkInput = CampaignLinkFields & { label: string };
export type ValidCampaignLink = Required<Omit<CampaignLinkInput, "content">> & { content: string | null; url: string };

const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/;

/** Checks a link sent by the browser and rebuilds its URL; null when anything is off. */
export function validateCampaignLink(input: unknown): ValidCampaignLink | null {
  if (!input || typeof input !== "object") return null;
  const value = input as Record<string, unknown>;
  const text = (key: string) => (typeof value[key] === "string" ? (value[key] as string).trim() : "");
  const label = text("label").replace(/\s+/g, " ").slice(0, 80);
  const lang = text("lang");
  const path = text("path");
  const source = text("source");
  const medium = text("medium");
  const campaign = text("campaign");
  const content = text("content") || null;

  if (!label || !isSupportedLang(lang) || !(LANDING_PAGES as readonly string[]).includes(path)) return null;
  if (!SLUG.test(source) || !SLUG.test(campaign) || (content !== null && !SLUG.test(content))) return null;
  if (!(MEDIUMS as readonly string[]).includes(medium)) return null;

  const fields = { lang, path, source, medium, campaign, content };
  return { label, ...fields, url: buildCampaignLink(fields) };
}
