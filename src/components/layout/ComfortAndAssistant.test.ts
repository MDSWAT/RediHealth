import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { COMFORT_COPY } from "@/components/layout/ComfortMenu";
import { TRIAGE_READING_LEVEL_COPY } from "@/components/health-assistant/TriagePlainLanguageToggle";
import { READING_LEVEL_COPY } from "@/components/health-information/ReadingLevelSwitcher";
import {
  applyComfortToDom,
  prefersCalmOrReducedMotion,
  setCalmMotion,
} from "@/lib/comfort-preferences";
import type { Lang } from "@/lib/i18n/translations";

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
      "src/components/landing/StackedSections.module.css",
      "src/components/news/RegionalHealthRibbon.module.css",
    ];
    for (const file of files) {
      const content = readFileSync(resolve(process.cwd(), file), "utf8");
      expect(content, file).toContain("html[data-calm-motion]");
      expect(content, file).not.toContain('html[data-calm-motion="true"]');
    }
  });
});

describe("plain reading mode copy (Pe scurt / Easy)", () => {
  it("uses Pe scurt in Romanian and Easy in English across ComfortMenu, triage toggle, and guide switcher", () => {
    expect(COMFORT_COPY.ro.simpleLabel).toBe("Pe scurt");
    expect(COMFORT_COPY.en.simpleLabel).toBe("Easy");

    expect(TRIAGE_READING_LEVEL_COPY.ro.simple).toBe("Pe scurt");
    expect(TRIAGE_READING_LEVEL_COPY.en.simple).toBe("Easy");

    expect(READING_LEVEL_COPY.ro.simple).toBe("Pe scurt");
    expect(READING_LEVEL_COPY.en.simple).toBe("Easy");
  });

  it("keeps concise, ampersand-free, sentence-case reading labels across all 7 languages", () => {
    for (const lang of LANGS) {
      const comfort = COMFORT_COPY[lang];
      const triage = TRIAGE_READING_LEVEL_COPY[lang];
      const reader = READING_LEVEL_COPY[lang];

      expect(triage.simple, lang).toBe(comfort.simpleLabel);
      expect(triage.standard, lang).toBe(comfort.completeLabel);
      expect(triage.aria, lang).toBe(comfort.explanationLabel);

      expect(reader.simple, lang).toBe(comfort.simpleLabel);
      expect(reader.complete, lang).toBe(comfort.completeLabel);
      expect(reader.ariaLabel, lang).toBe(comfort.explanationLabel);

      for (const value of Object.values(comfort)) {
        expect(value, `${lang}: "${value}"`).not.toContain("&");
        expect(value, `${lang}: "${value}"`).not.toContain("Cum explicăm");
        expect(value, `${lang}: "${value}"`).not.toContain("Pe scurt și simplu");
      }
    }
  });
});
