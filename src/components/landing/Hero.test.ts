import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HERO_NEED_ORDER, heroCopy, localHref, type HeroCopy } from "@/lib/i18n/hero-copy";
import type { Lang } from "@/lib/i18n/translations";

const currentLang = { value: "en" as Lang };

vi.mock("@/lib/i18n/language-context", async () => {
  const { translations } = await import("@/lib/i18n/translations");
  return {
    useLanguage: () => ({ lang: currentLang.value, t: translations[currentLang.value], setLang: vi.fn() }),
  };
});

const { Hero } = await import("./Hero");

const LANGS: Lang[] = ["en", "ro", "sq", "it"];

/** Every user-visible string in a locale, flattened (functions sampled with real values). */
function allStrings(copy: HeroCopy): string[] {
  const out: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === "string") out.push(value);
    else if (typeof value === "function") out.push(String(value(1, 2)));
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(copy);
  return out;
}

function keyShape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(keyShape);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, keyShape(inner)]));
  }
  return typeof value;
}

function renderHero(lang: Lang) {
  currentLang.value = lang;
  return renderToStaticMarkup(createElement(Hero));
}

describe("hero copy", () => {
  it("defines the same keys in every locale, so no locale falls back to another language", () => {
    const reference = JSON.stringify(keyShape(heroCopy.en));
    for (const lang of LANGS) {
      expect(JSON.stringify(keyShape(heroCopy[lang])), lang).toBe(reference);
      for (const text of allStrings(heroCopy[lang])) expect(text.trim(), lang).not.toBe("");
    }
  });

  it("keeps the Romanian 112 notice verbatim from the platform concept", () => {
    expect(heroCopy.ro.emergency.notice).toBe(
      "Semnele de alarmă și «Sună tu la 112» — aplicația nu apelează automat",
    );
  });

  it("has no Romanian in the English locale", () => {
    for (const text of allStrings(heroCopy.en)) {
      expect(text, text).not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
      expect(text, text).not.toMatch(/\b(și|sau|pentru|medic de familie|Sună)\b/);
    }
  });

  it("uses sentence case and no ampersands", () => {
    // Proper nouns and acronyms that may be capitalised mid-sentence.
    const allowed = new Set(["I", "REDI", "Roma", "CNAS", "112"]);
    for (const lang of LANGS) {
      for (const text of allStrings(heroCopy[lang])) {
        expect(text, `${lang}: ${text}`).not.toContain("&");
        const shouting = (text.match(/\b\p{Lu}{3,}\b/gu) ?? []).filter((word) => !allowed.has(word));
        expect(shouting, `${lang}: ${text}`).toEqual([]);
        const words = text.split(/\s+/).slice(1);
        const midSentenceCaps = words.filter(
          (word, index) =>
            /^[A-ZĂÂÎȘȚÇË]/u.test(word) &&
            !word.startsWith("«") && // quoted speech, e.g. the concept's «Sună tu la 112»
            !allowed.has(word.replace(/[^\p{L}\d]/gu, "")) &&
            !/[.?!:»]$/.test(text.split(/\s+/)[index] ?? ""),
        );
        expect(midSentenceCaps, `${lang}: ${text}`).toEqual([]);
      }
    }
  });

  it("offers a way to reach a doctor from every branch", () => {
    for (const lang of LANGS) {
      const { panel } = heroCopy[lang];
      expect(HERO_NEED_ORDER).toHaveLength(5);
      expect(panel.doctorPrompt).toMatch(/\?$/);
      expect(panel.problemDoctorLink.length).toBeGreaterThan(0);
      expect(panel.needs.problem.action.href).toBe("tel:112");
    }
  });

  it("keeps links in the visitor's language except tel: and the staff panel", () => {
    expect(localHref("/health-check", "ro")).toBe("/ro/health-check");
    expect(localHref("/get-help?mode=doctor", "it")).toBe("/it/get-help?mode=doctor");
    expect(localHref("tel:112", "en")).toBe("tel:112");
    expect(localHref("/panel", "sq")).toBe("/panel");
  });
});

describe("hero render", () => {
  beforeEach(() => {
    currentLang.value = "en";
  });

  it.each(LANGS)("renders the question, five needs and the 112 line in %s", (lang) => {
    const html = renderHero(lang);
    const copy = heroCopy[lang];

    expect(html).toContain(copy.panel.question.replace(/'/g, "&#x27;"));
    for (const id of HERO_NEED_ORDER) expect(html).toContain(copy.panel.needs[id].label.replace(/'/g, "&#x27;"));
    expect(html).toContain(copy.emergency.notice.replace(/'/g, "&#x27;"));
    expect(html).toContain('href="tel:112"');
    expect(html).toContain(`href="/${lang}/health-information"`);
  });

  it("renders no Romanian characters on the English page", () => {
    expect(renderHero("en")).not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
  });

  it("has exactly one h1 and no nested card markup", () => {
    const html = renderHero("en");
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).not.toMatch(/rounded-full[^"]*px-2\.5[^"]*py-0\.5/); // no badge pills
  });
});

describe("hero motion safety", () => {
  const css = readFileSync(path.resolve(__dirname, "../../app/globals.css"), "utf8");

  it("has no travelling shapes: no offset-path and no infinite animation on hero elements", () => {
    expect(css).not.toMatch(/offset-path/);
    const heroRules = css.slice(css.indexOf("/* ---------- Landing hero ---------- */"));
    expect(heroRules).not.toMatch(/infinite/);
    expect(heroRules).toMatch(/\.hero-spotlight\s*{[^}]*forwards/);
    expect(heroRules).toMatch(/prefers-reduced-motion: reduce[\s\S]*\.hero-spotlight/);
  });
});
