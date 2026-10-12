import type { FollowupItem } from "./types/patient";

/** A calendar date is not a UTC timestamp. Keep date-only records intact. */
export function localDateKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function requestDay(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : localDateKey(date);
}

export function dayLabel(key: string, locale: string, today: string, yesterday: string, now = new Date()): string {
  if (key === localDateKey(now)) return today;
  const previous = new Date(now);
  previous.setDate(previous.getDate() - 1);
  if (key === localDateKey(previous)) return yesterday;
  const date = new Date(`${key}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function followupLabel(item: FollowupItem, locale: string, allDay: string): string {
  const date = new Date(`${item.date.slice(0, 10)}T12:00:00`);
  const label = Number.isNaN(date.getTime()) ? item.date : date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  return `${label} · ${item.time ? `${item.time} (${item.timezone || ""})` : allDay}`;
}

export function sortFollowups(items: FollowupItem[]): FollowupItem[] {
  return [...items].sort((a, b) => `${a.date.slice(0, 10)} ${a.time || "00:00"}`.localeCompare(`${b.date.slice(0, 10)} ${b.time || "00:00"}`));
}
