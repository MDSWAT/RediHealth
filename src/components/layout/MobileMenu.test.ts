import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { chromeCopy } from "@/components/layout/chrome-copy";
import { COMFORT_COPY, ComfortMenu } from "@/components/layout/ComfortMenu";
import { languageSelectorCopy } from "@/components/layout/LanguageSelector";
import { Container } from "@/components/ui/Container";
import { LanguageContext } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";

const LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];

const HEADER_SOURCE = readFileSync(
  path.resolve(process.cwd(), "src/components/layout/Header.tsx"),
  "utf8",
);

const mobileMenuStart = HEADER_SOURCE.indexOf('id="mobile-menu"');
const mobileMenuEnd = HEADER_SOURCE.indexOf("</header>");
const MOBILE_MENU_SOURCE = HEADER_SOURCE.slice(mobileMenuStart, mobileMenuEnd);

describe("mobile navigation drawer (#mobile-menu)", () => {
  it("uses clean white ground, subtly bordered cards, and removes duplicate triage CTA", () => {
    expect(mobileMenuStart).toBeGreaterThan(-1);
    expect(mobileMenuEnd).toBeGreaterThan(mobileMenuStart);

    expect(MOBILE_MENU_SOURCE).toContain("bg-white");
    expect(HEADER_SOURCE).toContain("bg-white");
    expect(MOBILE_MENU_SOURCE).toContain("dark:bg-ink-950");
    expect(MOBILE_MENU_SOURCE).not.toContain("max-w-xl");
    expect(MOBILE_MENU_SOURCE).not.toContain("/health-assistant#triage");
    expect(MOBILE_MENU_SOURCE).not.toContain("tHeader.startHere");
    expect(MOBILE_MENU_SOURCE).not.toContain("truncate");
    expect(MOBILE_MENU_SOURCE).not.toContain("h-9 w-9");
    expect(MOBILE_MENU_SOURCE).not.toContain("rounded-2xl");
    expect(MOBILE_MENU_SOURCE).not.toContain("rounded-full");
    expect(MOBILE_MENU_SOURCE).not.toContain("bg-primary-soft/45");
    expect(MOBILE_MENU_SOURCE).toContain('variant="outline"');
    expect(HEADER_SOURCE).toContain("gap-0.5 md:hidden");
    expect(HEADER_SOURCE).toContain("capsuleCloseItem()");
    expect(HEADER_SOURCE).toMatch(/!mobileOpen\s*&&[\s\S]*?<UniversalEmergencyBanner/);

    // Account is a labelled row inside the menu, not an unlabelled icon beside Close.
    expect(MOBILE_MENU_SOURCE).toContain("data-mobile-account-trigger");
    expect(MOBILE_MENU_SOURCE).toContain("{portalLink.label}");
    expect(HEADER_SOURCE.slice(0, mobileMenuStart)).not.toContain("data-mobile-account-trigger");

    // One feedback link and no link that leaves the app.
    expect(MOBILE_MENU_SOURCE.split("openSiteFeedback()").length - 1).toBe(1);
    expect(MOBILE_MENU_SOURCE).not.toContain("mobileDrawerSub");
    expect(MOBILE_MENU_SOURCE).not.toContain("redi-ngo.eu");
    expect(MOBILE_MENU_SOURCE).not.toContain('target="_blank"');
  });

  it("puts language first, surfaces live doctor and AI assistant cards, and keeps the 112 row in view", () => {
    const languageAt = MOBILE_MENU_SOURCE.indexOf("<LanguageSelector");
    const liveDoctorAt = MOBILE_MENU_SOURCE.indexOf('href={withLangPrefix("/medic-online", lang)}');
    const aiAssistantAt = MOBILE_MENU_SOURCE.indexOf('href={withLangPrefix("/ai-assistant", lang)}');
    const linksAt = MOBILE_MENU_SOURCE.indexOf("primaryLinks.map");
    const homeAt = MOBILE_MENU_SOURCE.indexOf('href={withLangPrefix("/", lang)}');
    const feedbackAt = MOBILE_MENU_SOURCE.indexOf("openSiteFeedback()");
    const emergencyAt = MOBILE_MENU_SOURCE.indexOf("sticky bottom-0");

    expect(languageAt).toBeGreaterThan(-1);
    expect(languageAt).toBeLessThan(liveDoctorAt);
    expect(liveDoctorAt).toBeLessThan(aiAssistantAt);
    expect(aiAssistantAt).toBeLessThan(linksAt);
    expect(linksAt).toBeLessThan(homeAt);
    expect(MOBILE_MENU_SOURCE).toContain("<HomeIcon");
    expect(MOBILE_MENU_SOURCE).toContain("{chrome.homeShort}");

    // The 112 row is the last block in the flow, so when stuck it never rests on the links above it.
    expect(feedbackAt).toBeLessThan(emergencyAt);
    expect(MOBILE_MENU_SOURCE.indexOf("setDialerOpen(true)")).toBeGreaterThan(emergencyAt);
    expect(MOBILE_MENU_SOURCE).toContain("pb-[calc(0.5rem+env(safe-area-inset-bottom))]");

    // A tap on the logo closes an open menu, and the logo is a 44px target.
    expect(HEADER_SOURCE).toMatch(/<Logo[\s\S]*?className="min-h-11 [^"]*"[\s\S]*?onClick=\{closeMobile\}/);
  });

  it("places all 5 active core destinations including /mediatori in a unified single-column editorial list", () => {
    expect(HEADER_SOURCE).toContain('href: "/health-information"');
    expect(HEADER_SOURCE).toContain('href: "/health-check"');
    expect(HEADER_SOURCE).toContain('href: "/prescription-review"');
    expect(HEADER_SOURCE).toContain('href: "/find-help"');
    expect(HEADER_SOURCE).toContain('href: "/mediatori"');
    expect(HEADER_SOURCE).not.toContain('href: "/stiri"');

    // Desktop nav and mobile drawer share primaryLinks, with /mediatori inside the primary <nav>.
    expect(MOBILE_MENU_SOURCE).toContain("primaryLinks.map");
    expect(MOBILE_MENU_SOURCE).toContain("grid grid-cols-2");
    expect(MOBILE_MENU_SOURCE).toContain("divide-y");
    expect(MOBILE_MENU_SOURCE).toContain("ChevronRightIcon");
    expect(MOBILE_MENU_SOURCE).toContain("flex flex-wrap");
    expect(HEADER_SOURCE).toContain("mobileMenuRef.current.scrollTop = 0");
    expect(MOBILE_MENU_SOURCE).not.toContain("{tHeader.forMediatorsSub}");
    expect(MOBILE_MENU_SOURCE).not.toContain("block whitespace-nowrap text-meta");
    expect(MOBILE_MENU_SOURCE).not.toContain("sr-only");
    expect(MOBILE_MENU_SOURCE).not.toContain("line-clamp-1");
  });

  it("maps active routes 1-to-1 without dummy /stiri or /news routes, and keeps Footer public", () => {
    expect(HEADER_SOURCE).not.toContain('currentPath === "/news"');
    expect(HEADER_SOURCE).not.toContain('currentPath.startsWith("/news/")');
    expect(HEADER_SOURCE).not.toContain("isGuidanceRoute");

    const footerSource = readFileSync(
      path.resolve(process.cwd(), "src/components/layout/Footer.tsx"),
      "utf8",
    );
    expect(footerSource).not.toContain("/medic-online/programare");
    expect(footerSource).not.toContain("/panel");
    expect(footerSource).not.toContain('href: "/health-assistant"');
    expect(footerSource).not.toContain('href: "/stiri"');
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
        expect(typeof value, `${lang}`).toBe("string");
        expect(value.trim().length, `${lang}: "${value}"`).toBeGreaterThan(0);
        expect(value, `${lang}: "${value}"`).not.toContain("·");
        expect(value, `${lang}: "${value}"`).not.toContain("&");
        expect(value[0], `${lang}: "${value}"`).toBe(value[0].toLocaleUpperCase());
      }
    }
  });

  it("shows search icon, universal accessibility comfort trigger, and single-line menu trigger on phones without duplicating search inside the drawer", () => {
    const mobileClusterStart = HEADER_SOURCE.indexOf("{!mobileOpen &&");
    const mobileBarSlice = HEADER_SOURCE.slice(mobileClusterStart, mobileMenuStart);
    expect(mobileClusterStart).toBeGreaterThan(-1);
    expect(mobileBarSlice).toContain("openSmartSearch()");
    expect(mobileBarSlice).toContain('data-search-trigger=""');
    expect(mobileBarSlice).toContain('<ComfortMenu tone={onDarkBar ? "light" : "default"} />');
    expect(mobileBarSlice).not.toContain("showLabel");
    expect(HEADER_SOURCE).toContain('const isTransparent = currentPath === "/" && !scrolled && !mobileOpen;');
    expect(mobileBarSlice).toContain("chrome.closeWord : chrome.menuWord");
    expect(mobileBarSlice).toContain("whitespace-nowrap");
    expect(MOBILE_MENU_SOURCE).not.toContain("openSmartSearch()");

    for (const lang of LANGS) {
      const compactHtml = renderToStaticMarkup(
        createElement(
          LanguageContext.Provider,
          { value: { lang, t: translations[lang], setLang: () => {} } },
          createElement(ComfortMenu),
        ),
      );
      const compactTrigger = compactHtml.slice(0, compactHtml.indexOf("</button>") + 9);
      expect(compactTrigger, lang).toContain("<svg");
      expect(compactTrigger, lang).not.toContain("Aa");

      const labeledHtml = renderToStaticMarkup(
        createElement(
          LanguageContext.Provider,
          { value: { lang, t: translations[lang], setLang: () => {} } },
          createElement(ComfortMenu, { showLabel: true }),
        ),
      );
      const labeledTrigger = labeledHtml.slice(0, labeledHtml.indexOf("</button>") + 9);
      expect(labeledTrigger, lang).toContain("<svg");
      expect(labeledTrigger, lang).toContain('data-comfort-glyph=""');
      expect(labeledTrigger, lang).not.toContain("Aa");

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
    expect(MOBILE_MENU_SOURCE).toContain("footerLink");
    expect(HEADER_SOURCE).toContain("max-md:h-14");
    expect(HEADER_SOURCE).toContain("max-md:pt-1");
    const containerHtml = renderToStaticMarkup(
      createElement(Container, { "data-header-bar": "", className: "max-[359px]:px-2" }, "ok"),
    );
    expect(containerHtml).toContain("data-header-bar=");
  });
});
