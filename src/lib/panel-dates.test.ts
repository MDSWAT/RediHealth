import { describe, expect, it } from "vitest";
import { dayLabel, followupLabel, localDateKey, requestDay, sortFollowups } from "./panel-dates";
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
    expect(followupLabel(late, "en", "All day")).toContain("14:30 (Europe/Bucharest)");
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
});
