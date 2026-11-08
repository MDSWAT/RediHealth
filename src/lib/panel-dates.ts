import type { FollowupItem } from "./types/patient";

/** A calendar date is not a UTC timestamp. Keep date-only records intact. */
export function localDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function requestDay(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : localDateKey(date);
}

/**
 * The date shapes the staff panel prints. Every date and time in panel components goes through
 * formatPanelDate so a locale is handled the same way everywhere.
 */
export type PanelDateStyle = "date" | "dateWeekday" | "weekdayDay" | "monthYear" | "time" | "dateTime" | "full" | "numeric";

const INTL_OPTIONS: Record<PanelDateStyle, Intl.DateTimeFormatOptions> = {
  date: { day: "numeric", month: "short", year: "numeric" },
  dateWeekday: { weekday: "short", day: "numeric", month: "short", year: "numeric" },
  weekdayDay: { weekday: "short", day: "numeric" },
  monthYear: { month: "long", year: "numeric" },
  time: { hour: "2-digit", minute: "2-digit" },
  dateTime: { dateStyle: "medium", timeStyle: "short" },
  full: { dateStyle: "full" },
  numeric: {},
};

// Albanian names follow CLDR (lower case, as Albanian writes them in running text).
const SQ_MONTHS = ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"];
const SQ_MONTHS_SHORT = ["jan", "shk", "mar", "pri", "maj", "qer", "korr", "gush", "sht", "tet", "nën", "dhj"];
const SQ_WEEKDAYS = ["e diel", "e hënë", "e martë", "e mërkurë", "e enjte", "e premte", "e shtunë"];
const SQ_WEEKDAYS_SHORT = ["die", "hën", "mar", "mër", "enj", "pre", "sht"];

/** True when this runtime ships Intl data for the locale (headless Chromium has none for sq). */
export function hasIntlLocale(locale: string): boolean {
  try {
    return Intl.DateTimeFormat.supportedLocalesOf([locale]).length > 0;
  } catch {
    return false;
  }
}

/**
 * Albanian uses built-in month and weekday names and a 24-hour clock.
 * Chromium builds without Albanian ICU data (Intl.DateTimeFormat.supportedLocalesOf("sq-AL") is
 * empty) would otherwise print English. The tables are used for sq even where Intl has the data:
 * Node does, with a 12-hour "p.d./m.d." clock, so server and browser would render different text
 * and React would report a hydration mismatch.
 */
function usesAlbanianTables(locale: string): boolean {
  return locale.toLowerCase().startsWith("sq");
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function formatAlbanian(date: Date, style: PanelDateStyle): string {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const weekday = date.getDay();
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  switch (style) {
    case "date": return `${day} ${SQ_MONTHS_SHORT[month]} ${year}`;
    case "dateWeekday": return `${SQ_WEEKDAYS_SHORT[weekday]}, ${day} ${SQ_MONTHS_SHORT[month]} ${year}`;
    case "weekdayDay": return `${SQ_WEEKDAYS_SHORT[weekday]}, ${day}`;
    case "monthYear": return `${SQ_MONTHS[month]} ${year}`;
    case "time": return time;
    case "dateTime": return `${day} ${SQ_MONTHS_SHORT[month]} ${year}, ${time}`;
    case "full": return `${SQ_WEEKDAYS[weekday]}, ${day} ${SQ_MONTHS[month]} ${year}`;
    case "numeric": return `${day}.${month + 1}.${year}`;
  }
}

/** Formats a date or timestamp for the staff panel. Invalid input comes back unchanged (or "—"). */
export function formatPanelDate(value: Date | string | number, locale: string, style: PanelDateStyle = "date"): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return typeof value === "string" && value ? value : "—";
  if (usesAlbanianTables(locale)) return formatAlbanian(date, style);
  return new Intl.DateTimeFormat(locale, INTL_OPTIONS[style]).format(date);
}

/** Formats a reading such as 36.6 or 5.4 with the locale's decimal mark. */
export function formatPanelNumber(value: number, locale: string, digits = 0): string {
  if (usesAlbanianTables(locale)) return value.toFixed(digits).replace(".", ",");
  return value.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** Formats a calendar date key ("2026-11-07") without shifting it through UTC. */
export function formatDateKey(key: string, locale: string, style: PanelDateStyle = "date"): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(key.slice(0, 10)) ? formatPanelDate(`${key.slice(0, 10)}T12:00:00`, locale, style) : key;
}

export function dayLabel(key: string, locale: string, today: string, yesterday: string, now = new Date()): string {
  if (key === localDateKey(now)) return today;
  const previous = new Date(now);
  previous.setDate(previous.getDate() - 1);
  if (key === localDateKey(previous)) return yesterday;
  const date = new Date(`${key}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "—" : formatPanelDate(date, locale, "dateWeekday");
}

/** UTC offset of a time zone on a given day, written the way people read it: "GMT+2". Empty when unknown. */
export function zoneOffsetLabel(zone: string, date: Date = new Date()): string {
  if (!zone || Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", { timeZone: zone, timeZoneName: "shortOffset" })
      .formatToParts(date).find((part) => part.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

/**
 * The time of a follow-up. Its zone is shown only when the viewer is in a zone with a different
 * offset that day, as "10:00 (GMT+1)". Without a known viewer zone (server render, patient portal)
 * the zone is left out instead of printing a raw IANA name such as "Europe/Bucharest".
 */
export function followupTime(item: Pick<FollowupItem, "date" | "time" | "timezone">, allDay: string, viewerZone?: string | null): string {
  if (!item.time) return allDay;
  if (!viewerZone || !item.timezone || item.timezone === viewerZone) return item.time;
  const day = new Date(`${item.date.slice(0, 10)}T12:00:00Z`);
  const offset = zoneOffsetLabel(item.timezone, day);
  return offset && offset !== zoneOffsetLabel(viewerZone, day) ? `${item.time} (${offset})` : item.time;
}

/** Status of one follow-up ("Planned", ro "Programat"), not the plural filter label. */
export function followupStatusLabel(status: FollowupItem["status"], t: { itemScheduled: string; itemCompleted: string; itemCancelled: string }): string {
  return status === "completed" ? t.itemCompleted : status === "cancelled" ? t.itemCancelled : t.itemScheduled;
}

export function followupLabel(item: FollowupItem, locale: string, allDay: string, viewerZone?: string | null): string {
  const date = new Date(`${item.date.slice(0, 10)}T12:00:00`);
  const label = Number.isNaN(date.getTime()) ? item.date : formatPanelDate(date, locale, "date");
  return `${label} · ${followupTime(item, allDay, viewerZone)}`;
}

export function sortFollowups(items: FollowupItem[]): FollowupItem[] {
  return [...items].sort((a, b) => `${a.date.slice(0, 10)} ${a.time || "00:00"}`.localeCompare(`${b.date.slice(0, 10)} ${b.time || "00:00"}`));
}
