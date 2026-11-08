import { describe, expect, it } from "vitest";
import { dayLabel, followupLabel, formatDateKey, formatPanelDate, formatPanelNumber, localDateKey, requestDay, sortFollowups } from "./panel-dates";
import { validateFollowupInput } from "./validation";

describe("staff calendar dates", () => {
  it("groups requests across local midnight without treating calendar dates as UTC", () => {
    const before = new Date(2026, 9, 1, 23, 59);
    const after = new Date(2026, 9, 2, 0, 1);
    expect(requestDay(before.toISOString())).toBe("2026-10-01");
    expect(requestDay(after.toISOString())).toBe("2026-10-02");
    expect(dayLabel(requestDay(before.toISOString()), "en", "Today", "Yesterday", after)).toBe("Yesterday");
    expect(dayLabel(localDateKey(after), "en", "Today", "Yesterday", after)).toBe("Today");
  });
  it("handles yesterday across month/year boundaries", () => {
    expect(dayLabel("2025-12-31", "en", "Today", "Yesterday", new Date(2026, 0, 1, 0, 5))).toBe("Yesterday");
  });
  it("keeps old date-only follow-ups and sorts timed appointments within a day", () => {
    const old = { id: "old", title: "Review", date: "2026-10-02", status: "scheduled" as const };
    const late = { ...old, id: "late", time: "14:30", timezone: "Europe/Bucharest" };
    const early = { ...late, id: "early", time: "09:30" };
    expect(sortFollowups([late, old, early]).map((f) => f.id)).toEqual(["old", "early", "late"]);
    expect(followupLabel(old, "en", "All day")).toContain("All day");
    // No raw IANA zone: hidden when the viewer zone is unknown or has the same offset, readable offset otherwise.
    expect(followupLabel(late, "en", "All day")).toBe("Oct 2, 2026 · 14:30");
    expect(followupLabel(late, "en", "All day", "Europe/Bucharest")).toBe("Oct 2, 2026 · 14:30");
    expect(followupLabel(late, "en", "All day", "Europe/Chisinau")).toBe("Oct 2, 2026 · 14:30");
    expect(followupLabel(late, "en", "All day", "Europe/Rome")).toBe("Oct 2, 2026 · 14:30 (GMT+3)");
    expect(followupLabel(late, "en", "All day", "Europe/Rome")).not.toContain("Europe/");
  });
  it("accepts leap days, validates clock times and requires a real timezone for timed items", () => {
    const input = { title: "Review", date: "2028-02-29" };
    expect(validateFollowupInput(input).ok).toBe(true);
    expect(validateFollowupInput({ ...input, date: "2026-02-29" }).ok).toBe(false);
    expect(validateFollowupInput({ ...input, time: "25:00", timezone: "Europe/Bucharest" }).ok).toBe(false);
    expect(validateFollowupInput({ ...input, time: "12:00", timezone: "Imaginary/Zone" }).ok).toBe(false);
    expect(validateFollowupInput({ ...input, time: "12:00" }).ok).toBe(false);
    const result = validateFollowupInput({ ...input, time: "12:00", timezone: "Europe/Bucharest" });
    expect(result.ok && result.value.time).toBe("12:00");
  });
  it("prints Albanian dates and a 24-hour clock without relying on Intl sq data", () => {
    const morning = new Date(2026, 10, 7, 9, 5);
    const evening = new Date(2026, 10, 7, 21, 30);
    expect(formatPanelDate(morning, "sq-AL", "date")).toBe("7 nën 2026");
    expect(formatPanelDate(morning, "sq-AL", "dateWeekday")).toBe("sht, 7 nën 2026");
    expect(formatPanelDate(morning, "sq-AL", "weekdayDay")).toBe("sht, 7");
    expect(formatPanelDate(morning, "sq-AL", "monthYear")).toBe("nëntor 2026");
    expect(formatPanelDate(morning, "sq-AL", "time")).toBe("09:05");
    expect(formatPanelDate(evening, "sq-AL", "time")).toBe("21:30");
    expect(formatPanelDate(evening, "sq-AL", "dateTime")).toBe("7 nën 2026, 21:30");
    expect(formatPanelDate(morning, "sq-AL", "full")).toBe("e shtunë, 7 nëntor 2026");
    expect(formatPanelDate(morning, "sq-AL", "numeric")).toBe("7.11.2026");
    expect(formatDateKey("1970-05-12", "sq-AL")).toBe("12 maj 1970");
    expect(dayLabel("2026-11-02", "sq-AL", "Sot", "Dje", morning)).toBe("hën, 2 nën 2026");
    expect(followupLabel({ id: "a", title: "Kontroll", date: "2026-11-09", status: "scheduled", time: "10:00" }, "sq-AL", "Gjithë ditën")).toBe("9 nën 2026 · 10:00");
    expect(formatPanelNumber(36.6, "sq-AL", 1)).toBe("36,6");
    for (const style of ["date", "dateWeekday", "weekdayDay", "monthYear", "time", "dateTime", "full", "numeric"] as const) {
      expect(formatPanelDate(morning, "sq-AL", style)).not.toMatch(/Nov|Sat|AM|PM|p\.d\.|m\.d\./);
    }
  });
  it("keeps other locales on Intl and leaves bad input readable", () => {
    const date = new Date(2026, 10, 7, 9, 5);
    expect(formatPanelDate(date, "ro-RO", "date")).toBe(new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "short", year: "numeric" }).format(date));
    expect(formatPanelDate("not a date", "ro-RO")).toBe("not a date");
    expect(formatPanelDate("", "en-US")).toBe("—");
    expect(formatDateKey("someday", "en-US")).toBe("someday");
  });
});
