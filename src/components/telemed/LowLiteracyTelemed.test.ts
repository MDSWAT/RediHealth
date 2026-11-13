import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Lang } from "@/lib/i18n/translations";
import { calendarCopy, groupTimeSlotsByPeriod, normalizeBookingPhone } from "./AppointmentBookingCalendar";
import { heroCopy, MedicOnlineHero } from "./MedicOnlineHero";
import { OnCallQueueLauncher, queueCopy } from "./OnCallQueueLauncher";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];
const dir = __dirname;
const read = (name: string) => readFileSync(join(dir, name), "utf8");

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (typeof value === "function") {
    try {
      out.push(String((value as (...a: unknown[]) => unknown)(1, "10:00", "https://x.y")));
    } catch {
      /* ignore */
    }
  } else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => strings(v, out));
  return out;
}

describe("Scenario 7: online doctor hero and waiting room", () => {
  it("has no middle dots or ampersands in any locale", () => {
    for (const copy of [heroCopy, queueCopy]) {
      for (const lang of LANGS) {
        for (const s of strings(copy[lang])) {
          expect(s, `${lang}: ${s}`).not.toContain("·");
          expect(s, `${lang}: ${s}`).not.toContain("&");
        }
      }
    }
  });

  it("has listen and stop labels in all locales", () => {
    for (const lang of LANGS) {
      const c = queueCopy[lang] as { listen?: string; stop?: string; back?: string };
      expect(c.listen, lang).toBeTruthy();
      expect(c.stop, lang).toBeTruthy();
      expect(c.back, lang).toBeTruthy();
    }
  });

  it("never uses ndërmjetës in Albanian", () => {
    expect(JSON.stringify(strings(queueCopy.sq))).not.toContain("ndërmjetës");
  });

  it("renders the waiting room with a back link to /medic-online", () => {
    const html = renderToStaticMarkup(createElement(OnCallQueueLauncher));
    expect(html).toContain('href="/ro/medic-online"');
    expect(html).toContain("min-h-12");
    expect(html).not.toContain("rounded-full");
  });

  it("renders the hero without rounded-full pills and with min-h-12 CTAs", () => {
    const html = renderToStaticMarkup(createElement(MedicOnlineHero));
    expect(html).not.toContain("rounded-full");
    expect(html).toContain("min-h-12");
    expect(html).toContain("whitespace-nowrap");
  });

  it("source uses useReadAloud in the queue launcher", () => {
    expect(read("OnCallQueueLauncher.tsx")).toContain("useReadAloud");
  });
});

describe("Scenario 8: phone-call booking", () => {
  it("groups slots into morning and afternoon", () => {
    expect(groupTimeSlotsByPeriod(["09:00", "11:40", "12:00", "14:00", "17:40"])).toEqual({
      morning: ["09:00", "11:40"],
      afternoon: ["12:00", "14:00", "17:40"],
    });
    expect(groupTimeSlotsByPeriod([])).toEqual({ morning: [], afternoon: [] });
  });

  it("normalizes phone numbers forgivingly", () => {
    expect(normalizeBookingPhone(" (0721) 000.000 ")).toBe("0721000000");
    expect(normalizeBookingPhone("0721 000 000")).toBe("0721000000");
    expect(normalizeBookingPhone("+40 721-000-000")).toBe("+40721000000");
  });

  it("fixes Russian day names and sms tense", () => {
    expect(calendarCopy.ru.dayNames).toEqual(["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]);
    expect(calendarCopy.ru.sms("d", "t", "l")).not.toContain("позвонил");
    expect(calendarCopy.ru.sms("d", "t", "l")).toContain("врач позвонит");
  });

  it("has period headers, no ampersands or middle dots in any locale", () => {
    for (const lang of LANGS) {
      const c = calendarCopy[lang] as { morning?: string; afternoon?: string; listen?: string; stop?: string };
      expect(c.morning, lang).toBeTruthy();
      expect(c.afternoon, lang).toBeTruthy();
      expect(c.listen, lang).toBeTruthy();
      expect(c.stop, lang).toBeTruthy();
      for (const s of strings(calendarCopy[lang])) {
        expect(s).not.toContain("&");
        expect(s).not.toContain("·");
      }
    }
    expect(calendarCopy.ru.morning).toBe("Утром");
    expect(calendarCopy.ro.afternoon).toBe("După-amiaza");
  });

  it("has sentence-cased day and month names in every locale", () => {
    for (const day of calendarCopy.ru.dayNamesLong) expect(day[0]).toBe(day[0].toLowerCase());
    for (const m of calendarCopy.ru.monthNamesLong) expect(m[0]).toBe(m[0].toLowerCase());
    for (const m of calendarCopy.ru.monthNames) expect(m[0]).toBe(m[0].toLowerCase());
  });

  it("source has no rounded-full and uses useReadAloud", () => {
    const src = read("AppointmentBookingCalendar.tsx");
    expect(src).not.toContain("rounded-full");
    expect(src).toContain("useReadAloud");
    expect(src).toContain("normalizeBookingPhone(partyData.patientPhone)");
  });
});
