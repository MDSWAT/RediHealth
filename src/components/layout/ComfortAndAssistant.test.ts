import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { COMFORT_COPY, ComfortMenu } from "@/components/layout/ComfortMenu";
import { READING_LEVEL_COPY } from "@/components/health-information/ReadingLevelSwitcher";
import {
  applyComfortToDom,
  getHighContrastSnapshot,
  getUnderlineLinksSnapshot,
  getWideSpacingSnapshot,
  prefersCalmOrReducedMotion,
  resetComfortPreferences,
  setCalmMotion,
  setHighContrastPreference,
  getReadingLevelSnapshot,
  setReadingLevel,
  setTextScale,
  setUnderlineLinksPreference,
  setWideSpacingPreference,
  subscribeComfort,
} from "@/lib/comfort-preferences";
import type { Lang } from "@/lib/i18n/translations";
import { LanguageContext } from "@/lib/i18n/language-context";
import { translations } from "@/lib/i18n/translations";

const LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];

describe("calm motion preference synchronization", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("writes data-calm-motion='true' when active and removes it when turned off", () => {
    const storage = new Map<string, string>();
    const attrs = new Map<string, string>();
    const styles = new Map<string, string>();

    const root = {
      setAttribute: (name: string, value: string) => attrs.set(name, value),
      removeAttribute: (name: string) => attrs.delete(name),
      hasAttribute: (name: string) => attrs.has(name),
      style: {
        fontSize: "",
        removeProperty: (name: string) => styles.delete(name),
      },
    };

    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
      matchMedia: () => ({
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
      dispatchEvent: () => true,
    });
    vi.stubGlobal("document", { documentElement: root });

    setCalmMotion(true);
    expect(attrs.get("data-calm-motion")).toBe("true");
    expect(prefersCalmOrReducedMotion()).toBe(true);

    setCalmMotion(false);
    expect(attrs.has("data-calm-motion")).toBe(false);
    expect(prefersCalmOrReducedMotion()).toBe(false);

    // Ensure direct DOM sync preserves "true" when toggled back via storage.
    storage.set("redihealth-calm-motion", "1");
    applyComfortToDom();
    expect(attrs.get("data-calm-motion")).toBe("true");
  });

  it("wires CSS calm-motion overrides using html[data-calm-motion] across stylesheets", () => {
    const files = [
      "src/app/globals.css",
      "src/components/landing/HealthTopicsWheel.module.css",
      "src/components/landing/WheelBackdrop.module.css",
      "src/components/news/RegionalHealthRibbon.module.css",
    ];
    for (const file of files) {
      const content = readFileSync(resolve(process.cwd(), file), "utf8");
      expect(content, file).toContain("html[data-calm-motion]");
      expect(content, file).not.toContain('html[data-calm-motion="true"]');
    }
  });
});

describe("plain reading mode copy (Pe scurt / Simple)", () => {
  it("uses Pe scurt in Romanian and Simple in English on the ReadingLevelSwitcher", () => {
    expect(READING_LEVEL_COPY.ro.simple).toBe("Pe scurt");
    expect(READING_LEVEL_COPY.en.simple).toBe("Simple");
  });

  it("keeps concise, ampersand-free, sentence-case reading labels across all 7 languages", () => {
    for (const lang of LANGS) {
      const comfort = COMFORT_COPY[lang];
      const reader = READING_LEVEL_COPY[lang];

      // The accessibility menu no longer repeats the reading mode switch.
      expect(Object.keys(comfort)).not.toContain("simpleLabel");
      expect(reader.simple, lang).toBeTruthy();

      for (const value of Object.values(comfort)) {
        expect(value, `${lang}: "${value}"`).not.toContain("&");
        expect(value, `${lang}: "${value}"`).not.toContain("Cum explicăm");
        expect(value, `${lang}: "${value}"`).not.toContain("Pe scurt și simplu");
      }
    }
  });

  it("renders text size as a labelled three-stop slider without A+/A++ glyphs (P04)", () => {
    const html = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "en", t: translations.en, setLang: () => {} } },
        createElement(ComfortMenu, { variant: "drawer" }),
      ),
    );
    expect(html).toContain('type="range"');
    expect(html).toContain('min="0"');
    expect(html).toContain('max="2"');
    expect(html).toContain(`aria-valuetext="${COMFORT_COPY.en.scaleNormal}"`);
    expect(html).toMatch(/<label[^>]*for="[^"]+"[^>]*>Text size<\/label>/);
    expect(html).not.toContain('role="radiogroup"');
    expect(html).not.toContain("A+");
    expect(html).not.toContain("A++");
  });

  it("prevents synchronous re-entrant notification loops when switching reading level or syncing TriageStateMachine (P16)", () => {
    const storage = new Map<string, string>();
    const attrs = new Map<string, string>();
    const styles = new Map<string, string>();

    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
      addEventListener: () => {},
      dispatchEvent: () => true,
    });
    vi.stubGlobal("document", {
      documentElement: {
        setAttribute: (name: string, value: string) => attrs.set(name, value),
        removeAttribute: (name: string) => attrs.delete(name),
        style: {
          fontSize: "",
          removeProperty: (name: string) => styles.delete(name),
        },
      },
    });

    let calls = 0;
    const unsubscribe = subscribeComfort(() => {
      calls += 1;
      setTextScale("large");
    });
    try {
      // The reading switch is gone: everyone reads the detailed text, even with an old stored choice.
      storage.set("redihealth_reading_level", "simple");
      expect(getReadingLevelSnapshot()).toBe("complete");
      setReadingLevel("simple");
      expect(getReadingLevelSnapshot()).toBe("complete");
      calls = 0;
      setTextScale("large");
      expect(calls).toBe(1);
      setTextScale("large");
      expect(calls).toBe(1);
    } finally {
      unsubscribe();
      vi.unstubAllGlobals();
    }

    const triageSrc = readFileSync(
      resolve(process.cwd(), "src/components/health-assistant/TriageStateMachine.tsx"),
      "utf8",
    );
    expect(triageSrc).not.toContain("setReadingLevel");
    expect(triageSrc).toContain('dispatch({ type: "TOGGLE_PLAIN_LANGUAGE", value: nextPlain })');

    const switcherSrc = readFileSync(
      resolve(process.cwd(), "src/components/health-information/ReadingLevelSwitcher.tsx"),
      "utf8",
    );
    expect(switcherSrc).toContain("syncingRef");
  });

  it("renders one text size slider and shows Auto-read only on voice-enabled locales", () => {
    const enHtml = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "en", t: translations.en, setLang: () => {} } },
        createElement(ComfortMenu, { variant: "drawer" }),
      ),
    );
    expect((enHtml.match(/type="range"/g) ?? []).length).toBe(1);
    expect(enHtml).not.toContain(">Aa<");
    expect(enHtml).toContain(COMFORT_COPY.en.readingGuideToggle);
    expect(enHtml).toContain(COMFORT_COPY.en.grayscaleToggle);
    expect(enHtml).toContain(COMFORT_COPY.en.autoReadToggle);

    const romHtml = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "rom", t: translations.rom, setLang: () => {} } },
        createElement(ComfortMenu, { variant: "drawer" }),
      ),
    );
    expect(romHtml).not.toContain(COMFORT_COPY.rom.autoReadToggle);
  });

  it("renders AccessibilityIcon on header and collapsible triggers and exposes all inclusive switches across 7 locales", () => {
    const headerCompactHtml = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "en", t: translations.en, setLang: () => {} } },
        createElement(ComfortMenu, { variant: "header" }),
      ),
    );
    const headerCompactTrigger = headerCompactHtml.slice(0, headerCompactHtml.indexOf("</button>") + 9);
    expect(headerCompactTrigger).toContain("<svg");
    expect(headerCompactTrigger).not.toContain("Aa");
    expect(headerCompactHtml).toContain('role="dialog"');

    const headerLabeledHtml = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "ro", t: translations.ro, setLang: () => {} } },
        createElement(ComfortMenu, { variant: "header", showLabel: true }),
      ),
    );
    const headerLabeledTrigger = headerLabeledHtml.slice(0, headerLabeledHtml.indexOf("</button>") + 9);
    expect(headerLabeledTrigger).toContain("<svg");
    expect(headerLabeledTrigger).toContain('data-comfort-glyph=""');
    expect(headerLabeledTrigger).toContain(COMFORT_COPY.ro.comfortShort);
    expect(headerLabeledTrigger).not.toContain("Aa");

    const drawerCollapsedHtml = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "en", t: translations.en, setLang: () => {} } },
        createElement(ComfortMenu, { variant: "drawer", collapsible: true, open: false }),
      ),
    );
    const drawerCollapsedTrigger = drawerCollapsedHtml.slice(0, drawerCollapsedHtml.indexOf("</button>") + 9);
    expect(drawerCollapsedTrigger).toContain("<svg");
    expect(drawerCollapsedTrigger).not.toContain("Aa");

    for (const lang of LANGS) {
      const html = renderToStaticMarkup(
        createElement(
          LanguageContext.Provider,
          { value: { lang, t: translations[lang], setLang: () => {} } },
          createElement(ComfortMenu, { variant: "drawer" }),
        ),
      );
      const copy = COMFORT_COPY[lang];
      expect(html, lang).toContain(copy.highContrastToggle);
      expect(html, lang).toContain(copy.underlineLinksToggle);
      expect(html, lang).toContain(copy.wideSpacingToggle);
      expect(html, lang).toContain(copy.calmMotionToggle);
      expect(html, lang).toContain('role="switch"');
      expect(html, lang).toContain("rounded-full");
      expect(html, lang).toContain("rounded-2xl");
      expect(html, lang).not.toContain("hidden 2xl:inline");
    }

    const comfortSrc = readFileSync(resolve(process.cwd(), "src/components/layout/ComfortMenu.tsx"), "utf8");
    const iconsSrc = readFileSync(resolve(process.cwd(), "src/components/ui/icons.tsx"), "utf8");
    expect(comfortSrc).toContain("sm:rounded-3xl");
    expect(comfortSrc).toContain("sm:max-h-[min(78dvh,38rem)]");
    expect(comfortSrc).toContain("max-sm:max-h-[calc(100dvh-0.5rem)]");
    expect(comfortSrc).not.toContain("sheet-close");
    expect(comfortSrc).toContain("bg-[#c62f3c]");
    expect(comfortSrc).not.toContain("list-in");
    expect(comfortSrc).toContain("redihealth:unlock-audio");
    expect(comfortSrc).toContain("AccessibilityIcon");
    // The header glyph is the bare figure in the text colour, with no filled disc behind it.
    const accessibilityIconSrc = iconsSrc.slice(iconsSrc.indexOf("export function AccessibilityIcon"));
    expect(accessibilityIconSrc.slice(0, accessibilityIconSrc.indexOf("\n}\n"))).not.toContain("10.5 10.5 0 1 0 0 21");
  });
});

describe("inclusive accessibility preferences (highContrast, underlineLinks, wideSpacing)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults to false, persists to localStorage, syncs html attributes, and resets cleanly", () => {
    const storage = new Map<string, string>();
    const attrs = new Map<string, string>();
    const styles = new Map<string, string>();

    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
      matchMedia: () => ({
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
      dispatchEvent: () => true,
    });
    vi.stubGlobal("document", {
      documentElement: {
        setAttribute: (name: string, value: string) => attrs.set(name, value),
        removeAttribute: (name: string) => attrs.delete(name),
        hasAttribute: (name: string) => attrs.has(name),
        style: {
          fontSize: "",
          removeProperty: (name: string) => styles.delete(name),
        },
      },
    });

    resetComfortPreferences();
    expect(getHighContrastSnapshot()).toBe(false);
    expect(getUnderlineLinksSnapshot()).toBe(false);
    expect(getWideSpacingSnapshot()).toBe(false);

    let notifications = 0;
    const unsubscribe = subscribeComfort(() => {
      notifications += 1;
    });
    try {
      setHighContrastPreference(true);
      setHighContrastPreference(true);
      setUnderlineLinksPreference(true);
      setWideSpacingPreference(true);

      expect(notifications).toBe(3);
      expect(getHighContrastSnapshot()).toBe(true);
      expect(getUnderlineLinksSnapshot()).toBe(true);
      expect(getWideSpacingSnapshot()).toBe(true);
      expect(storage.get("redihealth-high-contrast")).toBe("1");
      expect(storage.get("redihealth-underline-links")).toBe("1");
      expect(storage.get("redihealth-wide-spacing")).toBe("1");
      expect(attrs.get("data-high-contrast")).toBe("true");
      expect(attrs.get("data-underline-links")).toBe("true");
      expect(attrs.get("data-wide-spacing")).toBe("true");

      attrs.clear();
      applyComfortToDom();
      expect(attrs.get("data-high-contrast")).toBe("true");
      expect(attrs.get("data-underline-links")).toBe("true");
      expect(attrs.get("data-wide-spacing")).toBe("true");

      resetComfortPreferences();
      expect(getHighContrastSnapshot()).toBe(false);
      expect(getUnderlineLinksSnapshot()).toBe(false);
      expect(getWideSpacingSnapshot()).toBe(false);
      expect(attrs.has("data-high-contrast")).toBe(false);
      expect(attrs.has("data-underline-links")).toBe(false);
      expect(attrs.has("data-wide-spacing")).toBe(false);
    } finally {
      unsubscribe();
    }
  });

  it("styles high-contrast, underline-links, and wide-spacing with presence selectors in globals.css", () => {
    const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toContain("html[data-high-contrast]:not(.dark)");
    expect(css).toContain("html[data-high-contrast].dark");
    expect(css).toContain("html[data-high-contrast] :is(footer, .bg-ink-950, .bg-ink-900, .dark, .phone-sheet)");
    expect(css).toContain("html[data-high-contrast] :focus-visible");
    expect(css).toContain("html[data-underline-links] a[href]");
    expect(css).toContain("html[data-wide-spacing]");
    expect(css).not.toContain('html[data-calm-motion="true"]');
  });
});
