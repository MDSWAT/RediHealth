import { isCountryWide, isNationalCounty, type NewsArticle, type NewsCountry } from "@/lib/data/news";

const COUNTRY_QUERY_NAMES: Record<NewsCountry, string> = {
  ro: "Romania",
  it: "Italy",
  md: "Moldova",
  hr: "Croatia",
  al: "Albania",
};

const ICS_MAX_LINE_OCTETS = 75;
const UTF8_ENCODER = new TextEncoder();

export interface ParsedCaravanHours {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export interface BuildCaravanIcsOptions {
  url?: string;
  now?: Date;
  locationLabel?: string;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatUtcTimestamp(date: Date): string {
  return (
    `${date.getUTCFullYear()}` +
    `${pad2(date.getUTCMonth() + 1)}` +
    `${pad2(date.getUTCDate())}T` +
    `${pad2(date.getUTCHours())}` +
    `${pad2(date.getUTCMinutes())}` +
    `${pad2(date.getUTCSeconds())}Z`
  );
}

function nextIsoDateCompact(isoDate: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return `${next.getUTCFullYear()}${pad2(next.getUTCMonth() + 1)}${pad2(next.getUTCDate())}`;
}

/** Escape RFC 5545 TEXT property values while stripping unsafe control bytes. */
export function escapeIcsText(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

/** Fold an RFC 5545 content line so every output line stays within 75 UTF-8 octets. */
export function foldIcsLine(line: string): string {
  if (UTF8_ENCODER.encode(line).length <= ICS_MAX_LINE_OCTETS) {
    return line;
  }

  const segments: string[] = [];
  let current = "";
  let currentBytes = 0;
  let maxBytes = ICS_MAX_LINE_OCTETS;

  for (const char of line) {
    const charBytes = UTF8_ENCODER.encode(char).length;
    if (currentBytes > 0 && currentBytes + charBytes > maxBytes) {
      segments.push(current);
      current = ` ${char}`;
      currentBytes = 1 + charBytes;
      maxBytes = ICS_MAX_LINE_OCTETS;
    } else {
      current += char;
      currentBytes += charBytes;
    }
  }

  if (current) {
    segments.push(current);
  }

  return segments.join("\r\n");
}

/** Extract start and end clock hours from localized caravan schedule strings. */
export function parseCaravanHours(hours: string): ParsedCaravanHours | null {
  const match = /(\d{1,2}):(\d{2})\s*[–—-]\s*(\d{1,2}):(\d{2})/.exec(hours);
  if (!match) return null;

  const startHour = Number(match[1]);
  const startMinute = Number(match[2]);
  const endHour = Number(match[3]);
  const endMinute = Number(match[4]);

  if (
    startHour > 23 ||
    startMinute > 59 ||
    endHour > 23 ||
    endMinute > 59 ||
    endHour * 60 + endMinute <= startHour * 60 + startMinute
  ) {
    return null;
  }

  return { startHour, startMinute, endHour, endMinute };
}

function isWideArea(area: string, country?: NewsCountry): boolean {
  return !area || isCountryWide({ county: area, country }) || isNationalCounty(area);
}

/** Build a Google Maps search URL targeting the caravan village, area, and country. */
export function caravanDirectionsUrl(
  article: Pick<NewsArticle, "county" | "country" | "caravanDetails">,
  rawCounty?: string,
): string {
  const country = article.country ?? "ro";
  const area = rawCounty?.trim() || article.county.trim();
  const village = article.caravanDetails?.village.trim() ?? "";

  const parts: string[] = [];
  if (village) parts.push(village);
  if (
    !isWideArea(area, country) &&
    !village.toLowerCase().includes(area.toLowerCase())
  ) {
    parts.push(area);
  }
  parts.push(COUNTRY_QUERY_NAMES[country]);

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(", "))}`;
}

/** Generate an RFC 5545 VCALENDAR/VEVENT payload with CRLF endings and 75-octet folding. */
export function buildCaravanIcs(
  article: NewsArticle,
  options: BuildCaravanIcsOptions = {},
): string {
  const compactDate = article.date.replace(/-/g, "");
  const parsedHours = article.caravanDetails
    ? parseCaravanHours(article.caravanDetails.hours)
    : null;
  const dtStamp = formatUtcTimestamp(options.now ?? new Date());

  const dateLines: string[] = [];
  if (parsedHours && /^\d{8}$/.test(compactDate)) {
    dateLines.push(
      `DTSTART:${compactDate}T${pad2(parsedHours.startHour)}${pad2(parsedHours.startMinute)}00`,
      `DTEND:${compactDate}T${pad2(parsedHours.endHour)}${pad2(parsedHours.endMinute)}00`,
    );
  } else {
    const nextCompact = nextIsoDateCompact(article.date) ?? compactDate;
    dateLines.push(
      `DTSTART;VALUE=DATE:${compactDate}`,
      `DTEND;VALUE=DATE:${nextCompact}`,
    );
  }

  const rawArea = article.county.trim();
  const area = options.locationLabel?.trim() || rawArea;
  const locationParts = [
    article.caravanDetails?.village.trim(),
    article.caravanDetails?.landmark.trim(),
    !isWideArea(rawArea, article.country) && !isWideArea(area, article.country) ? area : "",
  ].filter((part): part is string => Boolean(part));

  const descriptionParts = [
    article.summary.trim(),
    article.caravanDetails?.hours.trim(),
    article.caravanDetails?.freeServices.length
      ? article.caravanDetails.freeServices.join(", ")
      : "",
    options.url?.trim(),
  ].filter((part): part is string => Boolean(part));

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RediHealth//Civic Caravan//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${article.slug}-${compactDate}@redihealth.org`,
    `DTSTAMP:${dtStamp}`,
    ...dateLines,
    `SUMMARY:${escapeIcsText(article.title)}`,
    ...(locationParts.length > 0
      ? [`LOCATION:${escapeIcsText(locationParts.join(", "))}`]
      : []),
    ...(descriptionParts.length > 0
      ? [`DESCRIPTION:${escapeIcsText(descriptionParts.join("\n\n"))}`]
      : []),
    ...(options.url
      ? [`URL:${options.url.replace(/[\r\n\u0000-\u001F\u007F]/g, "")}`]
      : []),
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
}

/** Trigger browser download of an `.ics` calendar reminder for a caravan article. */
export function downloadCaravanIcs(
  article: NewsArticle,
  options: Omit<BuildCaravanIcsOptions, "now"> = {},
): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const payload = buildCaravanIcs(article, options);
  const blob = new Blob([payload], { type: "text/calendar;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `${article.slug}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1000);

  return true;
}
