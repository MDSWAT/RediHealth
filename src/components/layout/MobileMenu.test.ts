import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COMFORT_COPY } from "@/components/layout/ComfortMenu";
import { languageSelectorCopy } from "@/components/layout/LanguageSelector";
import type { Lang } from "@/lib/i18n/translations";

const LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];

const HEADER_SOURCE = readFileSync(
  path.resolve(process.cwd(), "src/components/layout/Header.tsx"),
  "utf8",
);

const mobileMenuStart = HEADER_SOURCE.indexOf('id="mobile-menu"');
const mobileMenuEnd = HEADER_SOURCE.indexOf("</header>");
const MOBILE_MENU_SOURCE = HEADER_SOURCE.slice(mobileMenuStart, mobileMenuEnd);

describe("mobile navigation drawer (#mobile-menu)", () => {
  it("uses warm paper ground, compact width container, and removes duplicate triage CTA", () => {
    expect(mobileMenuStart).toBeGreaterThan(-1);
    expect(mobileMenuEnd).toBeGreaterThan(mobileMenuStart);

    expect(MOBILE_MENU_SOURCE).toContain("bg-paper");
    expect(MOBILE_MENU_SOURCE).toContain("dark:bg-ink-950");
    expect(MOBILE_MENU_SOURCE).toContain("max-w-xl");
    expect(MOBILE_MENU_SOURCE).not.toContain("/health-assistant#triage");
    expect(MOBILE_MENU_SOURCE).not.toContain("tHeader.startHere");
    expect(MOBILE_MENU_SOURCE).not.toContain("truncate");
    expect(MOBILE_MENU_SOURCE).not.toContain("h-9 w-9");
    expect(MOBILE_MENU_SOURCE).not.toContain("rounded-2xl");
    expect(MOBILE_MENU_SOURCE).not.toContain("rounded-full");
    expect(MOBILE_MENU_SOURCE).not.toContain("bg-primary-soft/45");
    expect(HEADER_SOURCE).toContain("gap-0.5 md:hidden");
  });

  it("keeps primary navigation and mediator subtitles accessible inside sr-only", () => {
    expect(MOBILE_MENU_SOURCE).toContain('<span className="sr-only"> — {link.subtext}</span>');
    expect(MOBILE_MENU_SOURCE).toContain('<span className="sr-only"> — {tHeader.forMediatorsSub}</span>');
    expect(MOBILE_MENU_SOURCE).not.toContain("line-clamp-1");
  });

  it("wires listRow, collapsible, and openDrawerSection mutual exclusion", () => {
    expect(HEADER_SOURCE).toContain('useState<"language" | "comfort" | null>(null)');
    expect(MOBILE_MENU_SOURCE).toContain("listRow");
    expect(MOBILE_MENU_SOURCE).toContain("collapsible");
    expect(MOBILE_MENU_SOURCE).toContain('open={openDrawerSection === "language"}');
    expect(MOBILE_MENU_SOURCE).toContain('open={openDrawerSection === "comfort"}');
    expect(MOBILE_MENU_SOURCE).toContain('prev === "language" ? null : prev');
    expect(MOBILE_MENU_SOURCE).toContain('prev === "comfort" ? null : prev');
  });

  it("keeps LanguageSelector and ComfortMenu copy free of middle dots, ampersands, and non-sentence casing", () => {
    for (const lang of LANGS) {
      const langCopy = languageSelectorCopy[lang];
      const comfortCopy = COMFORT_COPY[lang];

      for (const value of [...Object.values(langCopy), ...Object.values(comfortCopy)]) {
        expect(value, `${lang}: "${value}"`).not.toContain("·");
        expect(value, `${lang}: "${value}"`).not.toContain("&");
        expect(value[0], `${lang}: "${value}"`).toBe(value[0].toLocaleUpperCase());
      }
    }
  });
});
