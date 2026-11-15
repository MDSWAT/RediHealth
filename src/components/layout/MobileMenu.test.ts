import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { chromeCopy } from "@/components/layout/chrome-copy";
import { COMFORT_COPY } from "@/components/layout/ComfortMenu";
import { languageSelectorCopy } from "@/components/layout/LanguageSelector";
import { Container } from "@/components/ui/Container";
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

  it("shows primary navigation and mediator subtitles visibly without sr-only or line clipping", () => {
    expect(MOBILE_MENU_SOURCE).toContain("{link.subtext}");
    expect(MOBILE_MENU_SOURCE).toContain("{tHeader.forMediatorsSub}");
    expect(MOBILE_MENU_SOURCE).toContain("text-meta font-normal leading-snug text-muted-foreground");
    expect(MOBILE_MENU_SOURCE).not.toContain("sr-only");
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

  it("shows search icon, Aa-only comfort trigger, and single-line menu trigger on phones while keeping search in the drawer", () => {
    const mobileClusterStart = HEADER_SOURCE.indexOf("{!mobileOpen &&");
    const mobileBarSlice = HEADER_SOURCE.slice(mobileClusterStart, mobileMenuStart);
    expect(mobileClusterStart).toBeGreaterThan(-1);
    expect(mobileBarSlice).toContain("openSmartSearch()");
    expect(mobileBarSlice).toContain('data-search-trigger=""');
    expect(mobileBarSlice).toContain('<ComfortMenu tone={isTransparent ? "light" : "default"} />');
    expect(mobileBarSlice).not.toContain("showLabel");
    expect(mobileBarSlice).toContain("chrome.closeWord : chrome.menuWord");
    expect(mobileBarSlice).toContain("whitespace-nowrap");
    expect(MOBILE_MENU_SOURCE).toContain("openSmartSearch()");

    for (const lang of LANGS) {
      const comfortShort = COMFORT_COPY[lang].comfortShort;
      const { menuWord, closeWord } = chromeCopy[lang];
      expect(comfortShort.length, `${lang}.comfortShort`).toBeLessThanOrEqual(10);
      for (const word of [comfortShort, menuWord, closeWord]) {
        expect(word.length, `${lang}: "${word}"`).toBeGreaterThan(0);
        expect(word, `${lang}: "${word}"`).not.toContain("&");
        expect(word[0], `${lang}: "${word}"`).toBe(word[0].toLocaleUpperCase());
      }
    }

    expect(HEADER_SOURCE).toContain('data-header-bar=""');
    expect(HEADER_SOURCE).toContain("flex h-16 items-center");
    expect(MOBILE_MENU_SOURCE).not.toContain("h-3 w-px");
    expect(MOBILE_MENU_SOURCE).toContain("compactTriggerLabel");
    const containerHtml = renderToStaticMarkup(
      createElement(Container, { "data-header-bar": "", className: "max-[359px]:px-2" }, "ok"),
    );
    expect(containerHtml).toContain("data-header-bar=");
  });
});
