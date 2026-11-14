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

  it("lists the alarm signs and a 112 call on the health-problem branch in every locale", () => {
    // The site-wide 112 bar lives in the layout; the hero's own emergency path is the problem branch.
    for (const lang of LANGS) {
      const copy = heroCopy[lang];
      expect(copy.emergency.alarmSigns.length, lang).toBeGreaterThanOrEqual(5);
      expect(copy.panel.needs.problem.action.href, lang).toBe("tel:112");
      expect(copy.panel.needs.problem.action.label, lang).toContain("112");
      expect(copy.panel.needs.problem.body, lang).toContain("112");
    }
  });

  it("says the same headline promise in every locale as the Romanian concept wording", () => {
    expect(heroCopy.ro.title).toBe("Informații medicale clare și ajutor să ajungi la medic.");
    expect(heroCopy.en.title).toMatch(/right care/);
    expect(heroCopy.sq.title).toMatch(/kujdes\S* (e|të) duhur/);
    expect(heroCopy.it.title).toMatch(/cure giuste/);
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

  it("keeps hero copy free of middle dots and clinical vulnerable framing", () => {
    for (const [lang, entry] of Object.entries(heroCopy)) {
      for (const text of allStrings(entry)) {
        expect(text, `${lang}: ${text}`).not.toContain("·");
      }
      expect(entry.lead, lang).not.toMatch(/vulnerabil|vulnerable/i);
    }
  });

  it("offers a way to reach a doctor from every branch", () => {
    for (const lang of LANGS) {
      const { panel } = heroCopy[lang];
      expect(HERO_NEED_ORDER).toHaveLength(6);
      expect(panel.doctorPrompt).toMatch(/\?$/);
      expect(panel.problemDoctorLink.length).toBeGreaterThan(0);
      expect(panel.needs.problem.action.href).toBe("tel:112");
    }
  });

  it("asks a different true-or-false question than the myth quiz further down the page", async () => {
    const { getHealthMyths } = await import("@/lib/i18n/health-myths");
    // Word stems of a statement; a large overlap means the same myth asked twice on one page.
    const stems = (text: string) =>
      new Set(
        text
          .toLowerCase()
          .split(/[^\p{L}]+/u)
          .filter((word) => word.length >= 3)
          .map((word) => word.slice(0, 4)),
      );
    for (const lang of LANGS) {
      const hero = stems(heroCopy[lang].panel.needs.learn.quiz!.statement);
      for (const myth of getHealthMyths(lang)) {
        const other = stems(myth.statement);
        const shared = [...other].filter((stem) => hero.has(stem)).length;
        const overlap = shared / new Set([...hero, ...other]).size;
        expect(overlap, `${lang}: ${myth.statement}`).toBeLessThan(0.34);
      }
    }
  });

  it("keeps links in the visitor's language except tel: and the staff panel", () => {
    expect(localHref("/health-check", "ro")).toBe("/ro/health-check");
    expect(localHref("/get-help?mode=mediator", "it")).toBe("/it/get-help?mode=mediator");
    expect(localHref("tel:112", "en")).toBe("tel:112");
    expect(localHref("/panel", "sq")).toBe("/panel");
  });
});

describe("hero render", () => {
  beforeEach(() => {
    currentLang.value = "en";
  });

  it.each(LANGS)("renders the question, five needs, mediator entry, and 112 action without top emergency popup in %s", (lang) => {
    const html = renderHero(lang);
    const copy = heroCopy[lang];

    expect(html).toContain(copy.panel.question.replace(/'/g, "&#x27;"));
    for (const id of HERO_NEED_ORDER) expect(html).toContain(copy.panel.needs[id].label.replace(/'/g, "&#x27;"));
    expect(html).not.toContain('role="tooltip"');
    expect(html).not.toContain("<dialog");
    expect(html).toContain('href="tel:112"');
    expect(html).toContain(`href="/${lang}/mediatori"`);
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

  it("renders every panel view in one grid cell, with only the first one active", () => {
    // Stacking all views makes the panel as tall as its tallest view, so
    // switching steps can never resize the panel or the hero.
    const html = renderHero("en");
    expect(html.match(/class="triage-view /g)).toHaveLength(1 + HERO_NEED_ORDER.length);
    expect(html.match(/data-active="true"/g)).toHaveLength(1);
    expect(html.match(/\binert=""/g)).toHaveLength(HERO_NEED_ORDER.length);
  });

  it("fills the first screen below the sticky header", () => {
    // The header's height (bar plus its 112 line) comes from --site-header-h, not a fixed number.
    expect(renderHero("en")).toMatch(/min-h-\[calc\(100svh-var\(--site-header-h\)\)\]/);
  });

  it.each(LANGS)("leaves the three steps to the help card in %s", (lang) => {
    // The steps moved into "Find out what to do", so the hero stays short enough for a laptop screen.
    expect(renderHero(lang)).not.toMatch(/<ol\b/);
    expect(heroCopy[lang].journey).toHaveLength(3);
  });

  it("renders the three steps inside the help options' lead card", () => {
    const help = readFileSync(path.resolve(__dirname, "HelpOptions.tsx"), "utf8");
    expect(help).toMatch(/<CarePath steps=\{\(heroCopy\[lang\] \?\? heroCopy\.ro\)\.journey\}/);
  });

  it("sets the headline as one plain sentence: no per-word spans, no aria-label override", () => {
    const html = renderHero("ro");
    const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/);
    expect(h1?.[1]).toBe(heroCopy.ro.title);
    expect(h1?.[0]).not.toContain("aria-label");
    expect(html).not.toContain("hero-word");
  });

  it.each(LANGS)("leaves the 112 line to the sticky header in %s", (lang) => {
    // The site-wide 112 line rides on top of the sticky header on every page, the home page
    // included, so the hero does not repeat it.
    // The triage panel keeps its own 112 action; the headline column has none.
    const html = renderHero(lang);
    const column = html.slice(html.indexOf("hero-enter"), html.indexOf('id="triage"'));
    expect(column).not.toContain('href="tel:112"');
  });

  it("makes no unconfirmed 'checked by doctors' claim", () => {
    for (const lang of LANGS) {
      for (const text of allStrings(heroCopy[lang])) {
        expect(text, `${lang}: ${text}`).not.toMatch(/checked by|verificat|verifikuar|kontrolluar|verificat[ei]/i);
      }
    }
  });

    it.each(LANGS)("renders no Romanian fallback strings in the panel chrome in %s", (lang) => {
    if (lang === "ro") return;
    const html = renderHero(lang);
    expect(html).not.toContain("Pentru mediatori");
    expect(html).not.toContain("voce de rezervă");
    expect(html).toContain(heroCopy[lang].panel.mediators);
  });
});

describe("landing interaction rules", () => {
  const landingDir = path.resolve(__dirname);
  const sources = ["Hero.tsx", "hero/CarePath.tsx", "hero/TriagePanel.tsx", "HelpOptions.tsx", "HelpOptionsMediatorBand.tsx", "HealthTopics.tsx", "TrueFalseQuizSection.tsx", "QuizFeedbackCard.tsx", "MythCardCarousel.tsx", "MythCategoryFilter.tsx", "TrustSection.tsx"].map(
    (file) => [file, readFileSync(path.join(landingDir, file), "utf8")] as const,
  );

  it("uses colour-only press feedback on the shared duration tokens", () => {
    for (const [file, source] of sources) {
      expect(source, file).not.toMatch(/active:scale/);
      expect(source, file).not.toMatch(/\bduration-(\d+|\[\d+ms\])/);
    }
  });

  it("keeps the hero photograph still: no scroll listener, no parallax transform", () => {
    const hero = sources.find(([file]) => file === "Hero.tsx")![1];
    expect(hero).not.toMatch(/hero-scroll|will-change|translate3d|addEventListener\("scroll"/);
  });

  it("shows the hero photo as an ambient top wash on phones and full-bleed from lg, loaded eagerly", () => {
    const hero = sources.find(([file]) => file === "Hero.tsx")![1];
    expect(hero).toMatch(/absolute inset-x-0 top-0 -z-30 h-56 lg:inset-0 lg:h-auto/);
    expect(hero).toMatch(/loading="eager"\s+fetchPriority="high"/);
    expect(hero).not.toMatch(/\bpriority\b|\bquality=/);
    // Phones read every line on solid ink: both full-bleed scrims exist from lg only.
    expect(hero.match(/-z-20 hidden bg-\[linear-gradient[^"]*lg:block/g)).toHaveLength(2);
  });

  it("renders the triage panel inline at all viewport sizes without hiding it below lg", () => {
    const hero = sources.find(([file]) => file === "Hero.tsx")![1];
    expect(hero).toMatch(/<div id="triage" className="scroll-mt-24">/);
    expect(hero).not.toMatch(/id="triage" className="[^"]*hidden/);
  });

  it("numbers the hero steps for screen readers and shows figures without a leading zero", () => {
    const carePath = sources.find(([file]) => file === "hero/CarePath.tsx")![1];
    expect(carePath).toMatch(/<ol\b/);
    expect(carePath).toMatch(/<span className="sr-only">\{index \+ 1\}\. <\/span>/);
    expect(carePath).not.toMatch(/padStart/);
  });

  it("shows a phone, not a camera, for the voice-only online doctor", () => {
    const carePath = sources.find(([file]) => file === "hero/CarePath.tsx")![1];
    expect(carePath).not.toMatch(/VideoIcon|CameraIcon/);
    expect(carePath).toMatch(/PhoneIcon/);
  });

  it("exposes quiz keys through aria-keyshortcuts, with 'r' for the Albanian 'e rreme'", () => {
    const quiz = sources.find(([file]) => file === "TrueFalseQuizSection.tsx")![1];
    expect(quiz).toMatch(/aria-keyshortcuts=/);
    expect(quiz).toMatch(/sq:\s*{\s*true:\s*\["v", "1"\],\s*false:\s*\["r", "2"\]/);
    expect(quiz).not.toMatch(/Shortcuts:|Scurtături|Shkurtore|Scorciatoie/);
  });
});

describe("landing accent roles and one source of copy", () => {
  const read = (file: string) => readFileSync(path.resolve(__dirname, file), "utf8");

  it("keeps red in the triage panel for the 112 call only, and focus on the ring token", () => {
    const panel = read("hero/TriagePanel.tsx");
    expect(panel).not.toMatch(/outline-primary|ring-primary|text-primary/);
    expect(panel.match(/(?<!:)bg-primary(?![\w-])/g) ?? []).toHaveLength(1);
    expect(panel).toMatch(/href="tel:112"[\s\S]{0,200}bg-primary/);
    expect(panel).toMatch(/outline-ring/);
  });

  it("sets the mediator band link in sapphire, not amber", () => {
    const band = read("HelpOptionsMediatorBand.tsx");
    expect(band).not.toMatch(/(text|decoration)-amber/);
    expect(band).toMatch(/text-sapphire/);
  });

  it("keeps the mediator band neutral, with amber only on its plate", () => {
    // The news ticker above is already pale yellow, so the band does not repeat a yellow ground.
    const band = read("HelpOptionsMediatorBand.tsx");
    expect(band).not.toMatch(/bg-amber-care-soft/);
    expect(band).toMatch(/<IconTile[^>]*tone="amber"/);
  });

  it("leads the help options with the assistant without reordering the copy", () => {
    const options = read("HelpOptions.tsx");
    expect(options).toMatch(/const ORDER = \[1, 0, 2, 3\] as const/);
    expect(options).toMatch(/NAV_LINK_ICONS\[/); // one glyph per destination, shared with the header
    expect(options).not.toMatch(/onPointerMove|surface-spotlight|useCalmReducedMotion/);
    expect(options).not.toMatch(/aria-label/); // a link's name is its visible text
    expect(options).not.toMatch(/rounded-full|animate-ping|live-sage/); // no status or badge pills
  });

  it("sets hero, help options and topics in the type scale and palette tokens", () => {
    for (const file of ["Hero.tsx", "hero/CarePath.tsx", "HelpOptions.tsx", "HelpOptionsMediatorBand.tsx", "HealthTopics.tsx"]) {
      const source = read(file);
      expect(source, file).not.toMatch(/font-(mono|serif)/);
      expect(source, file).not.toMatch(/text-\[\d/); // no arbitrary font sizes
      expect(source, file).not.toMatch(/\b(stone|slate|gray|zinc|neutral|red|blue|amber|green)-\d{2,3}\b/);
      expect(source, file).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(source, file).not.toMatch(/min-h-\[\d+px\]/);
      expect(source, file).not.toMatch(/line-clamp|\btruncate\b/);
    }
  });

  it("scrolls the myth categories in one row on phones and lists them down the left from lg", () => {
    const filter = read("MythCategoryFilter.tsx");
    expect(filter).toMatch(/overflow-x-auto[^"]*lg:flex-col/);
    expect(filter).toMatch(/maskImage/);
  });

  it("reads the topic titles and blurbs from the guide index", () => {
    const topics = read("HealthTopics.tsx");
    expect(topics).toMatch(/getHealthTopicsList\(lang\)/);
    expect(topics).not.toMatch(/healthTopics\.topics|\btopics\b\s*}\s*=\s*t\./);
  });

  it("renders the topics as lazy photo tiles in a Server Component", () => {
    const topics = read("HealthTopics.tsx");
    expect(topics).not.toMatch(/"use client"|from "motion/);
    expect(topics).toMatch(/from "next\/image"/);
    expect(topics).toMatch(/alt=""/); // the visible title follows the photo
    expect(topics).toMatch(/sizes="\(min-width: 640px\) 33vw, 50vw"/);
    expect(topics).not.toMatch(/\bpriority\b|\bquality=|loading="eager"/);
    // From lg the grid gives way to the wheel beside one card that follows it.
    expect(topics).toMatch(/grid-cols-2[^"]*sm:grid-cols-3[^"]*lg:hidden/);
    expect(topics).toMatch(/<HealthTopicsSpotlight[\s\S]*<HealthTopicsWheel/);
  });

  it("calls health mediators 'mediator' in Albanian, never 'ndërmjetës'", () => {
    for (const file of ["Hero.tsx", "HelpOptions.tsx", "HelpOptionsMediatorBand.tsx", "TrustSection.tsx"]) {
      expect(read(file), file).not.toMatch(/ndërmjetës/i);
    }
    expect(JSON.stringify(heroCopy.sq)).not.toMatch(/ndërmjetës/i);
    expect(heroCopy.sq.panel.mediators).toMatch(/mediator/);
  });
  it("keeps hover hints and behavioural subtitles short enough for one line across all languages", () => {
    for (const [lang, copy] of Object.entries(heroCopy)) {
      for (const [key, text] of Object.entries(copy.panel.subtitles)) {
        expect(text.length, `${lang}.subtitles.${key}: "${text}"`).toBeLessThanOrEqual(48);
      }
      for (const id of HERO_NEED_ORDER) {
        const hint = copy.panel.needs[id].hint;
        expect(hint.length, `${lang}.needs.${id}.hint: "${hint}"`).toBeLessThanOrEqual(48);
      }
    }
  });

  it("places the behavioural context dock below the 6 options inside Step 1", () => {
    const html = renderHero("ro");
    const listEnd = html.indexOf("</ul>");
    const dockIdx = html.indexOf(heroCopy.ro.panel.subtitles.default);
    const mediatorsIdx = html.indexOf(heroCopy.ro.panel.mediators);
    expect(listEnd).toBeGreaterThan(-1);
    expect(dockIdx).toBeGreaterThan(listEnd);
    expect(mediatorsIdx).toBeGreaterThan(dockIdx);
  });
});

describe("hero motion safety", () => {
  const css = readFileSync(path.resolve(__dirname, "../../app/globals.css"), "utf8");
  const heroStart = css.indexOf("/* ---------- Landing hero ---------- */");
  const heroEnd = css.indexOf("/* ---------- End landing hero ---------- */");
  const heroRules = css.slice(heroStart, heroEnd);

  it("keeps the hero block delimited so these checks read the right rules", () => {
    expect(heroStart).toBeGreaterThan(-1);
    expect(heroEnd).toBeGreaterThan(heroStart);
  });

  it("has no travelling shapes, loops, blur or staggered word reveal", () => {
    expect(css).not.toMatch(/offset-path/);
    expect(heroRules).not.toMatch(/infinite/);
    expect(heroRules).not.toMatch(/filter:\s*blur/);
    expect(heroRules).not.toMatch(/hero-word|hero-spotlight|care-rail/);
    expect(heroRules).not.toMatch(/var\(--i/); // no per-item stagger delays
  });

  it("enters once with the shared calm tokens and an 8px offset", () => {
    expect(heroRules).toMatch(/--hero-ease:\s*var\(--ease-out-calm\)/);
    expect(heroRules).toMatch(/\.hero-enter\s*{[^}]*var\(--dur-slow\)/);
    expect(heroRules).toMatch(/@keyframes hero-enter\s*{\s*from\s*{\s*opacity:\s*0;\s*transform:\s*translateY\(8px\)/);
  });

  it("goes static under reduced motion", () => {
    expect(heroRules).toMatch(/prefers-reduced-motion: reduce\)\s*{\s*\.hero-enter\s*{\s*animation: none/);
    expect(heroRules).toMatch(/prefers-reduced-motion: reduce[\s\S]*\.triage-view/);
  });

  it("animates only transform and opacity in the hero (no height or layout transitions)", () => {
    const transitioned = heroRules.match(/transition:[^;]*;/g) ?? [];
    for (const rule of transitioned) expect(rule, rule).not.toMatch(/\b(height|width|top|left|margin|padding)\b/);
  });
});
