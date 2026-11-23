import { formatPanelDate, requestDay } from "./panel-dates";

/** UTC text is shared by SSR and hydration; local formatting starts after hydration. */
export function inboxTimestamp(value: string, locale: string, style: "time" | "dateTime", localized: boolean): string {
  if (localized) return formatPanelDate(value, locale, style);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "—";
  const iso = date.toISOString();
  return `${style === "dateTime" ? `${iso.slice(0, 10)} ` : ""}${iso.slice(11, 16)} UTC`;
}

export function inboxDay(value: string, localized: boolean): string {
  if (localized) return requestDay(value);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}
