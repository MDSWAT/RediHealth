import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { translations, type Lang } from "@/lib/i18n/translations";
import { AppointmentBookingCalendar, calendarCopy, groupTimeSlotsByPeriod, normalizeBookingPhone } from "./AppointmentBookingCalendar";
import { FamilyBookingSelector } from "./FamilyBookingSelector";
import { heroCopy, MedicOnlineHero } from "./MedicOnlineHero";
import { OnCallQueueLauncher, queueCopy } from "./OnCallQueueLauncher";
import {
  buildJitsiEmbedUrl,
  PATIENT_VOICE_TOOLBAR,
  subscribeJitsiCallEnd,
} from "@/lib/jitsi-embed";

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

  it("renders the hero without rounded-full pills, with min-h-12 CTAs, text sound link, and pharmacy outside card", () => {
    const html = renderToStaticMarkup(createElement(MedicOnlineHero));
    expect(html).not.toContain("rounded-full");
    expect(html).toContain("min-h-12");
    expect(html).toContain("whitespace-nowrap");
    expect(html).toContain(heroCopy.ro.soundTest);
    expect(heroCopy.en.soundTest).toBe("Test your sound");
    expect(html).not.toContain("w-12 min-h-12 min-w-12");
    const heroSource = read("MedicOnlineHero.tsx");
    expect(heroSource).not.toContain("CheckIcon");
    expect(heroSource.indexOf("findHelp.nearestPharmacy")).toBeGreaterThan(
      heroSource.indexOf("{mp.cardBookingAction}"),
    );
  });

  it("source uses useReadAloud in the queue launcher", () => {
    expect(read("OnCallQueueLauncher.tsx")).toContain("useReadAloud");
  });

  it("deduplicates the hero strip and replaces 01/02/03 cards with an asymmetric localized preview on medic-online", () => {
    const heroHtml = renderToStaticMarkup(createElement(MedicOnlineHero));
    expect(heroHtml).not.toContain("<ul");
    for (const lang of LANGS) {
      expect(heroCopy[lang]).not.toHaveProperty("freeTitle");
      expect(heroCopy[lang]).not.toHaveProperty("browserTitle");
      expect(heroCopy[lang]).not.toHaveProperty("smsTitle");
    }

    const pageSource = readFileSync(join(dir, "../../app/medic-online/page.tsx"), "utf8");
    expect(pageSource).not.toContain("stepsBadge");
    expect(pageSource).not.toContain('"01"');
    expect(pageSource).not.toContain('"02"');
    expect(pageSource).not.toContain('"03"');
    expect(pageSource).not.toContain("rounded-full");
    expect(pageSource).not.toContain("transition-all");
    expect(pageSource).not.toContain("ndërmjetës");
    expect(pageSource).not.toContain("·");
    expect(pageSource).not.toContain(" & ");
    expect(pageSource).toContain("lg:grid-cols-");
    for (const lang of LANGS) {
      expect(pageSource).toContain(`${lang}:`);
    }
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
    expect(src).not.toContain("transition-all");
    expect(src).toContain("useReadAloud");
    expect(src).toContain("normalizeBookingPhone(partyData.patientPhone)");
  });

  it("supports selected-time CTA labels, mobile day-strip touch targets, and directional step motion across all locales", () => {
    for (const lang of LANGS) {
      const label = calendarCopy[lang].continueWithTime("10:00");
      expect(label, lang).toContain("10:00");
      expect(label, lang).not.toContain("&");
      expect(label, lang).not.toContain("·");
      expect(label.length, `${lang}: ${label}`).toBeLessThanOrEqual(28);
    }

    const html = renderToStaticMarkup(createElement(AppointmentBookingCalendar));
    expect(html).toContain("overflow-x-auto");
    expect(html).toContain("min-w-[3.5rem]");
    expect(html).toContain("sm:grid-cols-7");
    expect(html).toContain(calendarCopy.ro.continueToContact);

    const src = read("AppointmentBookingCalendar.tsx");
    expect(src).toContain("useCalmReducedMotion");
    expect(src).toContain("hc-step");
    expect(src).toContain("data-dir");
    expect(src).toContain("overflow-x-clip");
    expect(src).toContain("copy.continueWithTime(selectedTime)");
    expect(src).toContain("data-step-back");
    expect(src).toContain("<form");
  });

  it("renders FamilyBookingSelector with inline field validation semantics, numeric age inputMode, and min-h-12 WhatsApp row", () => {
    const baseData = {
      bookingType: "family" as const,
      patientName: "",
      patientPhone: "",
      sendWhatsApp: true,
    };

    const validHtml = renderToStaticMarkup(
      createElement(FamilyBookingSelector, {
        value: baseData,
        onChange: () => {},
      }),
    );
    expect(validHtml).toContain('id="patientAge"');
    expect(validHtml).toContain('inputMode="numeric"');
    expect(validHtml).toContain('for="sendWhatsApp"');
    expect(validHtml).toContain("min-h-12");
    expect(validHtml).not.toContain('aria-invalid="true"');

    const errorHtml = renderToStaticMarkup(
      createElement(FamilyBookingSelector, {
        value: baseData,
        onChange: () => {},
        errors: {
          patientName: calendarCopy.en.errorName,
          patientPhone: calendarCopy.en.errorPhone,
        },
      }),
    );
    expect(errorHtml).toContain('aria-invalid="true"');
    expect(errorHtml).toContain('aria-describedby="patientName-error"');
    expect(errorHtml).toContain('aria-describedby="patientPhone-error"');
    expect(errorHtml).toContain('id="patientName-error"');
    expect(errorHtml).toContain('id="patientPhone-error"');
    expect(errorHtml).toContain(calendarCopy.en.errorName);
    expect(errorHtml).toContain(calendarCopy.en.errorPhone);
  });

  it("strips Jitsi promotional close screens and internal hangup button, and reacts to postis call-end events", () => {
    expect(PATIENT_VOICE_TOOLBAR).not.toContain("hangup");
    const url = buildJitsiEmbedUrl({
      baseRoomUrl: "https://meet.jit.si/redihealth-live-101",
      apiId: 1,
      audioOnly: true,
      toolbarButtons: PATIENT_VOICE_TOOLBAR,
    });
    expect(url).toContain("config.enableClosePage=false");
    expect(url).toContain("interfaceConfig.SHOW_PROMOTIONAL_CLOSE_PAGE=false");
    expect(url).toContain("config.startAudioOnly=true");
    expect(url).not.toContain("hangup");
    expect(translations.en.medicOnlinePage.cardOnCallTitle).toContain("on\u2011call");

    const listeners = new Set<(event: MessageEvent) => void>();
    vi.stubGlobal("window", {
      addEventListener: (_type: string, cb: (event: MessageEvent) => void) => listeners.add(cb),
      removeEventListener: (_type: string, cb: (event: MessageEvent) => void) => listeners.delete(cb),
    });

    try {
      let ended = 0;
      const fakeIframe = {
        src: url,
        contentWindow: null,
        addEventListener: () => {},
        removeEventListener: () => {},
      } as unknown as HTMLIFrameElement;
      const unsub = subscribeJitsiCallEnd(fakeIframe, 1, () => {
        ended += 1;
      });
      for (const cb of listeners) {
        cb({
          origin: "https://meet.jit.si",
          source: null,
          data: JSON.stringify({
            postis: true,
            scope: "jitsi_meet_external_api_1",
            method: "message",
            params: { type: "event", name: "video-conference-left" },
          }),
        } as unknown as MessageEvent);
      }
      expect(ended).toBe(1);
      unsub();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
