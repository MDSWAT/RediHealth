/**
 * Website statistics rules, shared by the Nextlytics setup (src/nextlytics.ts), its database
 * backend (analytics-server.ts) and the tests.
 *
 * What is recorded per page view: the cleaned page path, the interface language, the host of the
 * referring website, utm_* campaign tags, country, device type, browser family and OS family.
 * What is never recorded: IP addresses, cookies, full user agents, query strings (other than
 * utm_*), staff and sign-in pages, triage notes, the patient portal, or anything typed.
 */
import { getLangFromPathname, stripLangFromPathname } from "@/lib/i18n/routing";

export const ANALYTICS_EVENTS = [
  "help_request_sent",
  "mediator_request_sent",
  "assistant_question_asked",
  "prescription_review_requested",
  "feedback_sent",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

/** Periods offered in the panel, in days. */
export const ANALYTICS_RANGES = [7, 30, 90, 365] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export function isAnalyticsEvent(value: unknown): value is AnalyticsEventName {
  return typeof value === "string" && (ANALYTICS_EVENTS as readonly string[]).includes(value);
}

/** Pages that are never counted (checked after the language prefix is removed). */
// The patient portal is excluded entirely: its address carries the patient's secret access token.
const PRIVATE_PREFIXES = ["/panel", "/offline", "/sign-in", "/contul-meu", "/patient-portal", "/health-check/note", "/api"];
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export type Campaign = Partial<Record<(typeof UTM_KEYS)[number], string>>;

export type CleanPage = { path: string; lang: string | null };

/**
 * Returns the path to record (without the language prefix and with secrets removed), or null when
 * the page must not be counted at all.
 */
export function cleanPagePath(rawPathname: string): CleanPage | null {
  let pathname: string;
  try {
    pathname = decodeURIComponent(rawPathname.split("?")[0].split("#")[0] || "/");
  } catch {
    return null;
  }
  if (!pathname.startsWith("/")) return null;

  const lang = getLangFromPathname(pathname);
  let path = stripLangFromPathname(pathname) || "/";
  if (path.length > 1) path = path.replace(/\/+$/, "");

  if (PRIVATE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return null;
  // Static files and Next.js internals are not pages.
  if (path.startsWith("/_next/") || /\.[a-z0-9]{2,5}$/i.test(path)) return null;

  return { path: path.slice(0, 300), lang };
}

/** utm_* tags only; every other query parameter is dropped. */
export function campaignFromSearch(search: string | URLSearchParams | null | undefined): Campaign {
  const params = typeof search === "string" || !search ? new URLSearchParams(search ?? "") : search;
  const campaign: Campaign = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim().toLowerCase();
    if (value) campaign[key] = value.slice(0, 100);
  }
  return campaign;
}

/** Host of an external referrer ("www." removed), or null for direct visits and our own pages. */
export function referrerHost(referrer: string | null | undefined, ownHost: string | null | undefined): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const own = (ownHost ?? "").toLowerCase().split(":")[0].replace(/^www\./, "");
    if (!host || host === own) return null;
    return host.slice(0, 200);
  } catch {
    return null;
  }
}

const BOT = /bot|crawl|spider|slurp|preview|scan|monitor|headless|lighthouse|pingdom|curl|wget|python|axios|node-fetch|go-http|java\/|facebookexternalhit|embedly|whatsapp|telegram|discord|skype|bingpreview|google-inspectiontool/i;

export function isBot(userAgent: string | null | undefined): boolean {
  return !userAgent || userAgent.length < 20 || BOT.test(userAgent);
}

export type DeviceInfo = { device: "mobile" | "tablet" | "desktop"; browser: string; os: string };

/** Coarse families only; the user agent itself is never stored. */
export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent;
  const tablet = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua);
  const mobile = !tablet && /Mobi|iPhone|iPod|Android|IEMobile|Opera Mini/i.test(ua);

  const os = /Windows/i.test(ua)
    ? "Windows"
    : /iPhone|iPad|iPod/i.test(ua)
      ? "iOS"
      : /Android/i.test(ua)
        ? "Android"
        : /Mac OS X|Macintosh/i.test(ua)
          ? "macOS"
          : /CrOS/i.test(ua)
            ? "ChromeOS"
            : /Linux/i.test(ua)
              ? "Linux"
              : "Other";

  const browser = /Edg\//i.test(ua)
    ? "Edge"
    : /OPR\/|Opera/i.test(ua)
      ? "Opera"
      : /SamsungBrowser/i.test(ua)
        ? "Samsung Internet"
        : /Firefox|FxiOS/i.test(ua)
          ? "Firefox"
          : /Chrome|CriOS/i.test(ua)
            ? "Chrome"
            : /Safari/i.test(ua)
              ? "Safari"
              : "Other";

  return { device: tablet ? "tablet" : mobile ? "mobile" : "desktop", browser, os };
}

/** Browsers that ask not to be tracked (Do Not Track or Global Privacy Control) are not counted. */
export function optedOut(headers: Headers): boolean {
  return headers.get("dnt") === "1" || headers.get("sec-gpc") === "1";
}

/** Two-letter country from the hosting provider's geolocation header; the IP itself is not kept. */
export function countryFromHeaders(headers: Headers): string | null {
  const value = (headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry") || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(value) && value !== "XX" && value !== "T1" ? value : null;
}
