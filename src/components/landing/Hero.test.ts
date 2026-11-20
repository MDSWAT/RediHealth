import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { heroCopy, localHref, type HeroCopy } from "@/lib/i18n/hero-copy";
import { homeSectionsCopy } from "@/lib/i18n/home-sections-copy";
import type { Lang } from "@/lib/i18n/translations";

const currentLang = { value: "en" as Lang };

vi.mock("@/lib/i18n/language-context", async () => {
  const { translations } = await import("@/lib/i18n/translations");
  return {
    useLanguage: () => ({ lang: currentLang.value, t: translations[currentLang.value], setLang: vi.fn() }),
  };
});

const { Hero } = await import("./Hero");

const ALL_LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];
const CORE_LANGS: Lang[] = ["en", "ro", "sq", "it"];

/** Every user-visible string in a locale, flattened (functions sampled with real values). */
function allStrings(copy: unknown): string[] {
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

describe("hero and home section copy", () => {
  it("defines the same keys in every locale, so no locale falls back to another language", () => {
    const heroRef = JSON.stringify(keyShape(heroCopy.en));
    const sectionsRef = JSON.stringify(keyShape(homeSectionsCopy.en));
    for (const lang of ALL_LANGS) {
      expect(JSON.stringify(keyShape(heroCopy[lang])), lang).toBe(heroRef);
      expect(JSON.stringify(keyShape(homeSectionsCopy[lang])), lang).toBe(sectionsRef);
      for (const text of allStrings(heroCopy[lang])) expect(text.trim(), lang).not.toBe("");
      for (const text of allStrings(homeSectionsCopy[lang].mediators)) expect(text.trim(), lang).not.toBe("");
    }
  });

  it("says the same headline promise in every locale as the Romanian concept wording", () => {
    expect(heroCopy.ro.title).toBe("Informații medicale clare și ajutor să ajungi la medic.");
    expect(heroCopy.en.title).toMatch(/right care/);
    expect(heroCopy.sq.title).toMatch(/kujdes\S* (e|të) duhur/);
    expect(heroCopy.it.title).toMatch(/cure giuste/);
  });

  it("has no Romanian in the English locale", () => {
    for (const text of [...allStrings(heroCopy.en), ...allStrings(homeSectionsCopy.en.mediators)]) {
      expect(text, text).not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
      expect(text, text).not.toMatch(/\b(și|sau|pentru|medic de familie|Sună)\b/);
    }
  });

  it("uses sentence case, concise CTA labels, and no ampersands across all 7 locales", () => {
    const allowed = new Set(["I", "REDI", "Roma", "CNAS", "112", "SMS"]);
    for (const lang of ALL_LANGS) {
      expect(heroCopy[lang].primaryCta.length, `${lang}.primaryCta`).toBeLessThanOrEqual(28);
      for (const text of [...allStrings(heroCopy[lang] as HeroCopy), ...allStrings(homeSectionsCopy[lang].mediators)]) {
        expect(text, `${lang}: ${text}`).not.toContain("&");
        expect(text, `${lang}: ${text}`).not.toContain("·");
        const shouting = (text.match(/\b\p{Lu}{3,}\b/gu) ?? []).filter((word) => !allowed.has(word));
        expect(shouting, `${lang}: ${text}`).toEqual([]);
      }
      expect(heroCopy[lang].lead, lang).not.toMatch(/vulnerabil|vulnerable/i);
    }
  });

  it("keeps mediator service copy realistic without over-broad promises across all 7 locales", () => {
    for (const lang of ALL_LANGS) {
      const serialized = JSON.stringify(homeSectionsCopy[lang].mediators);
      expect(serialized, lang).not.toMatch(/speaks your language|vorbește limba|flet gjuhën|parla la tua lingua|govori tvoj jezik|vakerel chi chhib|говорит на вашем языке/i);
      expect(serialized, lang).not.toMatch(/explain your prescriptions|explică rețetele|shpjegon recetat|spiega le ricette|objašnjava ti recepte|объясняет рецепты/i);
      expect(serialized, lang).not.toMatch(/\btablet[aăe]?\b|планшет/i);
    }
  });

  it("keeps links in the visitor's language except tel: and the staff panel", () => {
    expect(localHref("/health-check", "ro")).toBe("/ro/health-check");
    expect(localHref("/mediatori#solicita", "it")).toBe("/it/mediatori#solicita");
    expect(localHref("tel:112", "en")).toBe("tel:112");
    expect(localHref("/panel", "sq")).toBe("/panel");
  });
});

describe("hero render", () => {
  beforeEach(() => {
    currentLang.value = "en";
  });

  it.each(ALL_LANGS)("renders one calm entry CTA to /health-check and zero hero dialogs or detours in %s", (lang) => {
    const html = renderHero(lang);
    const copy = heroCopy[lang];

    expect(html).toContain(copy.trustLine.replace(/'/g, "&#x27;"));
    expect(html).toContain(copy.primaryCta.replace(/'/g, "&#x27;"));
    expect(html).toContain(`href="/${lang}/health-check"`);
    expect(html).toContain("bg-paper!");
    expect(html).toContain("text-ink-950!");

    // No dialogs, search forms, 6-row menus, second unwell button, or mediator/doctor detours in the hero.
    expect(html).not.toContain("<dialog");
    expect(html).not.toContain('role="tooltip"');
    expect(html).not.toContain('role="search"');
    expect(html).not.toContain("triage-option-");
    expect(html).not.toContain("triage-sheet");
    expect(html).not.toContain("/medic-online");
    expect(html).not.toContain(`href="/${lang}/mediatori"`);
    expect(html).not.toContain(`href="/${lang}/health-information"`);
  });

  it("renders no Romanian characters on the English page", () => {
    expect(renderHero("en")).not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
  });

  it("has exactly one h1 and no badge pills", () => {
    const html = renderHero("en");
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).not.toMatch(/rounded-full[^"]*px-2\.5[^"]*py-0\.5/);
  });

  it("fills the first screen: the whole screen below lg, the screen below the sticky header from lg", () => {
    expect(renderHero("en")).toMatch(/min-h-svh[^"]*lg:min-h-\[calc\(100svh-var\(--site-header-h\)\)\]/);
  });

  it("simplifies src/app/page.tsx to natural vertical sections without sticky stacking, news ribbon, online doctor, or quiz", () => {
    const pageSrc = readFileSync(path.resolve(__dirname, "../../app/page.tsx"), "utf8");
    expect(pageSrc).not.toContain("StackedSections");
    expect(pageSrc).not.toContain("StackLayer");
    expect(pageSrc).not.toContain("RegionalHealthRibbon");
    expect(pageSrc).not.toContain("OnlineDoctorSection");
    expect(pageSrc).not.toContain("TrueFalseQuizSection");
    expect(pageSrc).toMatch(/<Hero\s*\/>[\s\S]*<HealthTopics\s*\/>[\s\S]*<MediatorsSection\s*\/>[\s\S]*<TrustSection\s*\/>/);
  });

  it("sets the headline as plain sentences: the concept's one sentence from lg, two short ones below it", () => {
    const html = renderHero("ro");
    const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/);
    expect(h1?.[1]).toContain(`<span class="hero-in hidden [--in:140ms] lg:inline-block">${heroCopy.ro.title}</span>`);
    expect(h1?.[1]).toContain(`<span class="hero-in block [--in:140ms]">${heroCopy.ro.mobileTitle[0]}</span><span class="hero-title-warm hero-in block [--in:230ms]">${heroCopy.ro.mobileTitle[1]}</span>`);
    expect(h1?.[0]).not.toContain("aria-label");
    expect(html).not.toContain("hero-word");
    for (const lang of ALL_LANGS) {
      for (const part of heroCopy[lang].mobileTitle) {
        expect(part.length, `${lang}: ${part}`).toBeLessThanOrEqual(34);
        expect(part, lang).toMatch(/\.$/);
      }
      expect(heroCopy[lang].mobileLead.length, lang).toBeLessThanOrEqual(36);
    }
  });

  it.each(CORE_LANGS)("leaves the 112 line to the sticky header in %s", (lang) => {
    const html = renderHero(lang);
    expect(html).toContain('id="hero-title"');
    expect(html).not.toContain("hero-enter");
    expect(html).not.toContain('href="tel:112"');
  });

  it("makes no unconfirmed 'checked by doctors' claim", () => {
    for (const lang of ALL_LANGS) {
      for (const text of allStrings(heroCopy[lang])) {
        expect(text, `${lang}: ${text}`).not.toMatch(/checked by|verificat|verifikuar|kontrolluar|verificat[ei]/i);
      }
    }
  });
});

describe("landing interaction rules", () => {
  const landingDir = path.resolve(__dirname);
  const ownedLandingFiles = [
    "Hero.tsx",
    "hero/HeroRoutes.tsx",
    "hero/HeroDock.tsx",
    "HealthTopics.tsx",
    "MediatorsSection.tsx",
    "MediatorServices.tsx",
    "TrustSection.tsx",
  ];
  const sources = ownedLandingFiles.map(
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

  it("keeps the desktop photos desktop-only via getImageProps and <picture> source while hiding WheelBackdrop below lg", () => {
    const hero = sources.find(([file]) => file === "Hero.tsx")![1];
    const photos = readFileSync(path.join(landingDir, "hero/HeroPhotos.tsx"), "utf8");
    const css = readFileSync(path.join(landingDir, "hero/HeroPhotos.module.css"), "utf8");
    expect(hero).toMatch(/<HeroPhotos \/>/);
    expect(hero).toMatch(/hidden lg:block[\s\S]*<WheelBackdrop placement="hero"/);
    expect(photos).toMatch(/getImageProps\(/);
    expect(photos).toMatch(/<source media="\(min-width: 1024px\)"/);
    expect(photos).toMatch(/loading: index === 0 \? "eager" : "lazy"[\s\S]*fetchPriority: index === 0 \? "high" : "low"/);
    expect(photos).toMatch(/aria-hidden="true"/);
    expect(photos).not.toMatch(/\bpriority\b|\bquality=/);
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*animation: none/);
    expect(css).toMatch(/html\[data-calm-motion\]\) \.photo[\s\S]*animation: none/);
  });

  it("renders one single entry CTA on both HeroRoutes and HeroDock without draggable sheets, modals, or wheel easter eggs", () => {
    const routes = sources.find(([file]) => file === "hero/HeroRoutes.tsx")![1];
    const dock = sources.find(([file]) => file === "hero/HeroDock.tsx")![1];
    const dockCss = readFileSync(path.join(landingDir, "hero/HeroDock.module.css"), "utf8");

    expect(routes).toContain('localHref("/health-check", lang)');
    expect(routes).not.toContain("<dialog");
    expect(routes).not.toContain("TriagePanel");
    expect(routes).not.toContain("openSmartSearch");

    expect(dock).toContain('localHref("/health-check", lang)');
    expect(dock).not.toContain("<dialog");
    expect(dock).not.toContain("TriagePanel");
    expect(dock).not.toContain("openSheet");
    expect(dock).not.toContain("ringOn");
    expect(dock).not.toContain("onPointerDown");
    expect(dock).not.toMatch(/bg-primary|text-primary|active:scale|\btruncate\b/);
    expect(dock).toMatch(/<source media="\(max-width: 1023px\)"/);
    expect(dockCss).toMatch(/prefers-reduced-motion: reduce[\s\S]*animation: none/);
    expect(dockCss).toMatch(/html\[data-calm-motion\]\) \.photo[\s\S]*animation: none/);
  });
});

describe("landing accent roles and one source of copy", () => {
  const read = (file: string) => readFileSync(path.resolve(__dirname, file), "utf8");

  it("keeps --color-primary exclusive to 112 and out of all landing components and wheel CSS", () => {
    const files = [
      "Hero.tsx",
      "hero/HeroRoutes.tsx",
      "hero/HeroDock.tsx",
      "HealthTopics.tsx",
      "HealthTopicsSpotlight.tsx",
      "HealthTopicsWheel.module.css",
      "MediatorsSection.tsx",
      "MediatorServices.tsx",
      "TrustSection.tsx",
    ];
    for (const file of files) {
      const src = read(file);
      expect(src, file).not.toMatch(/\bbg-primary\b|\btext-primary\b|--color-primary/);
    }
  });

  it("sets hero and topics in the type scale and palette tokens without raw colors or pills", () => {
    for (const file of ["Hero.tsx", "HealthTopics.tsx", "MediatorsSection.tsx", "TrustSection.tsx"]) {
      const source = read(file);
      expect(source, file).not.toMatch(/font-(mono|serif)/);
      expect(source, file).not.toMatch(/text-\[\d/);
      expect(source, file).not.toMatch(/\b(stone|slate|gray|zinc|neutral|red|blue|amber|green)-\d{2,3}\b/);
      expect(source, file).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(source, file).not.toMatch(/min-h-\[\d+px\]/);
      expect(source, file).not.toMatch(/line-clamp|\btruncate\b/);
    }
  });

  it("renders all 8 health topics in a scannable Server Component grid with one action button to /health-information", () => {
    const topics = read("HealthTopics.tsx");
    expect(topics).not.toMatch(/"use client"|from "motion/);
    expect(topics).toMatch(/getHealthTopicsList\(lang\)/);
    expect(topics).toMatch(/from "next\/image"/);
    expect(topics).toMatch(/alt=""/);
    expect(topics).not.toMatch(/\bpriority\b|\bquality=|loading="eager"/);
    expect(topics).not.toContain("HealthTopicsSpotlight");
    expect(topics).not.toContain("HealthTopicsWheel");
    expect(topics).toContain('withLangPrefix("/health-information", lang)');
    expect(topics).toContain("bg-wellness");
    expect(topics).toContain("bg-sapphire");
  });

  it("simplifies MediatorsSection to one action button to /mediatori#solicita and frames TrustSection commitments in cards", () => {
    const mediators = read("MediatorsSection.tsx");
    const hero = read("Hero.tsx");
    const trust = read("TrustSection.tsx");

    expect(mediators).toContain('withLangPrefix("/mediatori#solicita", lang)');
    expect(mediators).not.toContain("/get-help?mode=mediator");
    expect(mediators).not.toContain("first:border-l-0");
    expect(mediators).toMatch(/overflow-hidden[\s\S]*sm:-ml-3\.5/);
    expect(mediators).toMatch(/flex flex-col[\s\S]*sm:flex-row sm:flex-wrap/);
    expect(hero).not.toContain("first:border-l-0");

    expect(trust).toContain("bg-card");
    expect(trust).toContain("bg-sapphire");
    expect(trust).toContain("bg-wellness");
    expect(trust).toContain("bg-amber-care");
  });

  it("calls health mediators 'mediator' in Albanian, never 'ndërmjetës'", () => {
    for (const file of ["Hero.tsx", "TrustSection.tsx", "MediatorsSection.tsx"]) {
      expect(read(file), file).not.toMatch(/ndërmjetës/i);
    }
    expect(JSON.stringify(heroCopy.sq)).not.toMatch(/ndërmjetës/i);
    expect(JSON.stringify(homeSectionsCopy.sq)).not.toMatch(/ndërmjetës/i);
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

  it("has no travelling shapes, loops, blur or per-word reveal", () => {
    expect(css).not.toMatch(/offset-path/);
    expect(heroRules).not.toMatch(/infinite/);
    expect(heroRules).not.toMatch(/filter:\s*blur/);
    expect(heroRules).not.toMatch(/hero-word|hero-spotlight|care-rail/);
  });

  it("keeps the load sequence short: whole blocks only, every step started within half a second", () => {
    const hero = readFileSync(path.resolve(__dirname, "Hero.tsx"), "utf8");
    const delays = [...hero.matchAll(/\[--in:(\d+)ms\]/g)].map((match) => Number(match[1]));
    expect(delays.length).toBeGreaterThan(0);
    for (const delay of delays) expect(delay).toBeLessThanOrEqual(500);
    expect(heroRules).toMatch(/prefers-reduced-motion: no-preference[\s\S]*html:not\(\[data-calm-motion\]\) \.hero-in/);
    const intro = heroRules.slice(heroRules.indexOf("@keyframes hero-in"), heroRules.indexOf("@keyframes hero-dock-in") + 120);
    expect(intro).not.toMatch(/\b(height|width|top|left|margin|padding|filter)\s*:/);
  });

  it("renders the hero headline visible on first paint with the shared calm ease token", () => {
    expect(heroRules).toMatch(/--hero-ease:\s*var\(--ease-out-calm\)/);
    expect(heroRules).not.toMatch(/\.hero-enter|@keyframes\s+hero-enter/);
  });

  it("goes static under reduced motion", () => {
    expect(heroRules).toMatch(/prefers-reduced-motion: reduce[\s\S]*\.quiz-result/);
    expect(heroRules).toMatch(/prefers-reduced-motion: reduce[\s\S]*\.triage-view/);
  });

  it("animates only transform and opacity in the hero (no height or layout transitions)", () => {
    const transitioned = heroRules.match(/transition:[^;]*;/g) ?? [];
    for (const rule of transitioned) expect(rule, rule).not.toMatch(/\b(height|width|top|left|margin|padding)\b/);
  });
});
