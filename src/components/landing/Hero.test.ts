import { existsSync, readFileSync } from "node:fs";
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
const await_panel = await import("./hero/TriagePanel");

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

  it("orders needs by urgency with doctor online in the six choices and removes the inline quiz (P35)", () => {
    expect(HERO_NEED_ORDER).toEqual(["problem", "risk", "doctor", "nearby", "prescription", "navigate"]);
    const panelSrc = readFileSync(path.resolve(__dirname, "hero/TriagePanel.tsx"), "utf8");
    expect(panelSrc).toContain("doctor: StethoscopeIcon");
    expect(panelSrc).toContain("!isDoctor");
    expect(panelSrc).not.toContain("<Quiz");

    for (const lang of ["ro", "en", "sq", "it", "hr", "rom", "ru"] as const) {
      const doctor = heroCopy[lang].panel.needs.doctor;
      expect(doctor.action.href, lang).toBe("/medic-online");
      expect(doctor.points, lang).toHaveLength(3);
      expect("quiz" in doctor, lang).toBe(false);
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
    // The 112 call lives in the "I feel unwell" answer, which opens from its row in a dialog.
    expect(html).toMatch(/<button[^>]*id="triage-option-problem"[^>]*aria-haspopup="dialog"/);
    expect(html).toContain(`href="/${lang}/mediatori"`);
    // The doctor route opens its answer (with the link to /medic-online) from its own row.
    expect(html).toMatch(/<button[^>]*id="triage-option-doctor"[^>]*aria-haspopup="dialog"/);
    expect(html).not.toContain(`href="/${lang}/health-information"`);
  });

  it("renders no Romanian characters on the English page", () => {
    expect(renderHero("en")).not.toMatch(/[ăâîșțĂÂÎȘȚ]/);
  });

  it("has exactly one h1 and no nested card markup", () => {
    const html = renderHero("en");
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).not.toMatch(/rounded-full[^"]*px-2\.5[^"]*py-0\.5/); // no badge pills
  });

  it("opens non-direct needs in the panel dialog and links risk/prescription directly (P29)", () => {
    // Direct rows act straight from the quick options; the others open their answer in a dialog,
    // mounted on first use, so the server markup holds no panel views at all.
    const viewNeeds = HERO_NEED_ORDER.filter((id) => !heroCopy.en.panel.needs[id].direct);
    const html = renderHero("en");
    expect(viewNeeds).toEqual(["problem", "doctor", "nearby", "navigate"]);
    expect(html).not.toContain('class="triage-view ');
    for (const id of viewNeeds) {
      expect(html).toMatch(new RegExp(`<button[^>]*id="triage-option-${id}"[^>]*aria-haspopup="dialog"`));
    }
    expect(html).toMatch(/<a[^>]*id="triage-option-risk"[^>]*href="\/en\/health-check"/);
    expect(html).toMatch(/<a[^>]*id="triage-option-prescription"[^>]*href="\/en\/prescription-review"/);
    expect(heroCopy.en.panel.needs.nearby.action.label).toBe("See places near you");
  });

  it("fills the first screen: the whole screen below lg, the screen below the sticky header from lg", () => {
    // The header's height (bar plus its 112 line) comes from --site-header-h, not a fixed number.
    expect(renderHero("en")).toMatch(/min-h-svh[^"]*lg:min-h-\[calc\(100svh-var\(--site-header-h\)\)\]/);
  });

  it.each(LANGS)("keeps the hero column compact without an inline step list in %s", (lang) => {
    expect(renderHero(lang)).not.toMatch(/<ol\b/);
    expect(heroCopy[lang].journey).toHaveLength(3);
  });

  it("makes the hero panel the only router on the home page (P06)", () => {
    const pageSrc = readFileSync(path.resolve(__dirname, "../../app/page.tsx"), "utf8");
    expect(pageSrc).not.toContain("HelpOptions");
    expect(pageSrc).toMatch(/<Hero\b[^>]*\/>[\s\S]*<RegionalHealthRibbon\s*\/>[\s\S]*<HealthTopics\s*\/>/);
    expect(existsSync(path.resolve(__dirname, "HelpOptions.tsx"))).toBe(false);
    expect(existsSync(path.resolve(__dirname, "HelpOptionsMediatorBand.tsx"))).toBe(false);
  });

  it("sets the headline as plain sentences: the concept's one sentence from lg, two short ones below it", () => {
    const html = renderHero("ro");
    const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/);
    // Desktop keeps the concept wording as one sentence; phones get two short sentences, the second quieter.
    expect(h1?.[1]).toContain(`<span class="hero-in hidden [--in:140ms] lg:inline-block">${heroCopy.ro.title}</span>`);
    // The two phone sentences each start a line; the second carries the warm tint.
    expect(h1?.[1]).toContain(`<span class="hero-in block [--in:140ms]">${heroCopy.ro.mobileTitle[0]}</span><span class="hero-title-warm hero-in block [--in:230ms]">${heroCopy.ro.mobileTitle[1]}</span>`);
    expect(h1?.[0]).not.toContain("aria-label");
    expect(html).not.toContain("hero-word");
    for (const lang of ["ro", "en", "sq", "it", "hr", "rom", "ru"] as const) {
      // Short enough to hold a display size on a phone, and each part is a full sentence.
      for (const part of heroCopy[lang].mobileTitle) {
        expect(part.length, `${lang}: ${part}`).toBeLessThanOrEqual(34);
        expect(part, lang).toMatch(/\.$/);
      }
      expect(heroCopy[lang].mobileLead.length, lang).toBeLessThanOrEqual(36);
    }
  });

  it.each(LANGS)("leaves the 112 line to the sticky header in %s", (lang) => {
    // The site-wide 112 line rides on top of the sticky header on every page, the home page
    // included, so the hero does not repeat it.
    // The triage panel keeps its own 112 action; the headline column has none.
    const html = renderHero(lang);
    const column = html.slice(html.indexOf("hero-grid"), html.indexOf('id="triage"'));
    expect(column).toContain('id="hero-title"');
    expect(column).not.toContain("hero-enter");
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
  const sources = ["Hero.tsx", "hero/TriagePanel.tsx", "HealthTopics.tsx", "TrueFalseQuizSection.tsx", "QuizFeedbackCard.tsx", "MythCardCarousel.tsx", "MythCategoryFilter.tsx", "TrustSection.tsx"].map(
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
    expect(photos).toMatch(/<source media="\(min-width: 1024px\)"/); // phones never request them
    expect(photos).toMatch(/loading: index === 0 \? "eager" : "lazy"[\s\S]*fetchPriority: index === 0 \? "high" : "low"/);
    expect(photos).toMatch(/aria-hidden="true"/);
    expect(photos).not.toMatch(/\bpriority\b|\bquality=/);
    // Still on the first photo under reduced and calm motion.
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*animation: none/);
    expect(css).toMatch(/html\[data-calm-motion\]\) \.photo[\s\S]*animation: none/);
  });

  it("shows the quick options from lg and opens the panel from the paper dock as a sheet below lg", () => {
    const hero = sources.find(([file]) => file === "Hero.tsx")![1];
    expect(hero).toMatch(/<div id="triage" className="hero-in hidden scroll-mt-24 \[--in:300ms\] lg:block">\s*<HeroRoutes copy=\{copy\} lang=\{lang\} \/>/);
    expect(hero).toMatch(/<HeroDock copy=\{copy\} lang=\{lang\} topics=\{wheelTopics\} onNote=\{setNote\} \/>/);

    const dock = readFileSync(path.join(landingDir, "hero/HeroDock.tsx"), "utf8");
    // One main action (sapphire) plus the unwell-now shortcut; both open the same panel in a modal sheet.
    expect(dock).toMatch(/className=\{`flex flex-col lg:hidden \$\{styles\.sheetRoot\}`\}/);
    expect(dock.match(/variant="action"/g)).toHaveLength(1);
    expect(dock).toMatch(/openSheet\("question"\)/);
    expect(dock).toMatch(/openSheet\("problem"\)/);
    expect(dock).toMatch(/<TriagePanel[\s\S]*variant="sheet"/);
    expect(dock).toMatch(/showModal\(\)/);
    expect(dock).not.toMatch(/pushState|popstate/); // the modal dialog handles Escape and Android back itself
    expect(dock).not.toMatch(/bg-primary|text-primary|active:scale|\btruncate\b/);
    // The sheet is mounted on first use, so the server markup has one chooser, not two.
    expect(renderHero("en")).not.toContain("triage-sheet");
  });

  it("keeps the phone backdrop decorative and still under reduced and calm motion", () => {
    const dock = readFileSync(path.join(landingDir, "hero/HeroDock.tsx"), "utf8");
    const css = readFileSync(path.join(landingDir, "hero/HeroDock.module.css"), "utf8");
    // The photos are hidden whole; the wheel's drawing is hidden part by part, because its chakra
    // is a real button (the easter egg that shows the topic icons), labelled and pressed-aware.
    expect(dock).toMatch(/aria-hidden="true" className=\{styles\.backdrop\}/);
    expect(dock).toMatch(/aria-hidden="true" className=\{styles\.glow\}/);
    expect(dock).toMatch(/ref=\{outerRef\} aria-hidden="true"/);
    expect(dock).toMatch(/aria-pressed=\{ringOn\}\s*aria-label=\{toggleCopy\.ring\}/);
    expect(dock).toMatch(/<source media="\(max-width: 1023px\)"/); // never requested on desktop
    expect(css).toMatch(/prefers-reduced-motion: reduce[\s\S]*animation: none/);
    expect(css).toMatch(/html\[data-calm-motion\]\) \.photo[\s\S]*animation: none/);
    // The whole wheel is drawn, chakra included, and it keeps turning.
    expect(dock).toMatch(/<WheelStars stars=\{OUTER_STARS\}[\s\S]*<WheelStars stars=\{INNER_STARS\}[\s\S]*<WheelSpokes/);
    expect(css).toMatch(/\.hub \{[\s\S]*?animation: hero-dock-wheel-spin/);
    expect(css).toMatch(/\.outer \{\s*--outer-turn: \d+s;\s*animation: hero-dock-wheel-spin/);
    expect(css).toMatch(/\.inner \{\s*animation: hero-dock-wheel-spin/);
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
    expect(panel).not.toMatch(/outline-primary|ring-primary/);
    // The 112 call is a secondary, outlined red button: a soft red ground and red label, once each.
    expect(panel.match(/(?<!:)bg-primary(?![\w-])/g) ?? []).toHaveLength(1);
    expect(panel.match(/(?<!:)text-primary(?![\w-])/g) ?? []).toHaveLength(1);
    expect(panel).toMatch(/href="tel:112"[\s\S]{0,300}bg-primary\/\[0\.06\][^"]*text-primary/);
    expect(panel).toMatch(/outline-ring/);
  });

  it("makes the doctor the main action on the health-problem branch, with the 112 call above it", () => {
    const panel = read("hero/TriagePanel.tsx");
    const call = panel.indexOf('href="tel:112"');
    const doctor = panel.indexOf("copy.needs.doctor.action.label");
    expect(call).toBeGreaterThan(-1);
    expect(doctor).toBeGreaterThan(call);
    // The sapphire action on this branch goes to the doctor, not to 112.
    expect(panel.slice(call, doctor)).toMatch(/href=\{localHref\("\/medic-online", lang\)\}\s*variant="action"/);
  });

  it("renders the triage footer mediator link as plain text without decorative UsersIcon (P06)", () => {
    const panel = read("hero/TriagePanel.tsx");
    expect(panel).not.toContain("UsersIcon");
    expect(panel).toContain('href={localHref("/mediatori", lang)}');
    for (const lang of ["ro", "en", "sq", "it", "hr", "rom", "ru"] as const) {
      expect(heroCopy[lang].panel.mediators.length, lang).toBeLessThanOrEqual(24);
    }
    expect(heroCopy.en.panel.mediators).toBe("Ask a mediator");
  });

  it("sets hero and topics in the type scale and palette tokens", () => {
    for (const file of ["Hero.tsx", "HealthTopics.tsx"]) {
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
    for (const file of ["Hero.tsx", "hero/TriagePanel.tsx", "TrustSection.tsx"]) {
      expect(read(file), file).not.toMatch(/ndërmjetës/i);
    }
    expect(JSON.stringify(heroCopy.sq)).not.toMatch(/ndërmjetës/i);
    expect(heroCopy.sq.panel.mediators).toMatch(/mediator/i);
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
    const { TriagePanel } = await_panel;
    const html = renderToStaticMarkup(
      createElement(TriagePanel, { copy: heroCopy.ro.panel, alarmSigns: heroCopy.ro.emergency.alarmSigns, lang: "ro" }),
    );
    const listEnd = html.indexOf("</ul>");
    const dockIdx = html.indexOf(heroCopy.ro.panel.subtitles.default);
    const mediatorsIdx = html.indexOf(heroCopy.ro.panel.mediators);
    expect(listEnd).toBeGreaterThan(-1);
    expect(dockIdx).toBeGreaterThan(listEnd);
    expect(mediatorsIdx).toBeGreaterThan(dockIdx);
  });

  it("avoids orphaned leading dividers when fact strips wrap on Hero and MediatorsSection", () => {
    const hero = read("Hero.tsx");
    const mediators = read("MediatorsSection.tsx");

    expect(hero).not.toContain("first:border-l-0");
    expect(mediators).not.toContain("first:border-l-0");
    expect(hero).toMatch(/overflow-hidden[\s\S]*-ml-3\.5/);
    expect(mediators).toMatch(/overflow-hidden[\s\S]*sm:-ml-3\.5/);
    expect(mediators).toMatch(/flex flex-col[\s\S]*sm:flex-row sm:flex-wrap/);
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
    // The sequence only runs when motion is welcome, and never under the in-app calm setting.
    expect(heroRules).toMatch(/prefers-reduced-motion: no-preference[\s\S]*html:not\(\[data-calm-motion\]\) \.hero-in/);
    // Only position, scale, rotation and opacity move on arrival.
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
