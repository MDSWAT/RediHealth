import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SUB_REGION_INFO } from "@/components/health-check/anatomy-3d-data";
import { LanguageContext } from "@/lib/i18n/language-context";
import { getHealthTopicBySlug } from "@/lib/i18n/health-information-topics";
import { translations, type Lang } from "@/lib/i18n/translations";
import { TopicAnatomyExplorer } from "./TopicAnatomyExplorer";
import { TopicDetailPageContent } from "./TopicDetailPageContent";
import {
  TOPIC_ANATOMY_CONFIGS,
  TOPIC_ANATOMY_UI_COPY,
  getTopicAnatomyConfig,
  isTopicAnatomySlug,
  type TopicAnatomySlug,
} from "./topic-anatomy-config";

const ALL_LANGS: readonly Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];

const MAPPED_TOPICS: readonly TopicAnatomySlug[] = [
  "heart-health",
  "smoking",
  "physical-activity",
  "healthy-eating",
  "diabetes",
  "womens-health",
  "preventive-screening",
];

const readSrc = (relPath: string) =>
  readFileSync(resolve(process.cwd(), relPath), "utf8");

function renderWithLang(
  lang: Lang,
  element: ReturnType<typeof createElement>,
): string {
  return renderToStaticMarkup(
    createElement(
      LanguageContext.Provider,
      { value: { lang, t: translations[lang], setLang: () => {} } },
      element,
    ),
  );
}

const ALLOWED_UPPERCASE_TOKENS = new Set([
  "3D",
  "ECG",
  "BMI",
  "BP",
  "HPV",
  "ORL",
  "Pap",
  "Papa",
  "Babeș-Papanicolau",
]);

function assertSentenceCaseAndCleanText(value: string, label: string) {
  expect(value.trim().length, `${label} must not be empty`).toBeGreaterThan(0);
  expect(value, `${label} must not contain "&"`).not.toContain("&");
  expect(value, `${label} must not contain middle dot`).not.toContain("\u00b7");
  expect(
    /^[\p{Lu}\p{N}]/u.test(value),
    `${label} must start with uppercase letter or digit: "${value}"`,
  ).toBe(true);

  // Reject ALL CAPS phrases (any word >= 3 letters that is all uppercase and not a known acronym)
  const words = value.split(/\s+/);
  for (const rawWord of words) {
    const word = rawWord.replace(/^[^\p{L}\p{N}-]+|[^\p{L}\p{N}-]+$/gu, "");
    if (!word || ALLOWED_UPPERCASE_TOKENS.has(word)) continue;
    const letters = word.replace(/[^\p{L}]/gu, "");
    if (letters.length >= 3) {
      expect(
        letters === letters.toUpperCase(),
        `${label} must not contain ALL CAPS word "${word}" in "${value}"`,
      ).toBe(false);
    }
  }
}

function assertNotTitleCase(value: string, label: string) {
  // Check short headings/labels/buttons for accidental English/Latin Title Case
  const words = value
    .split(/\s+/)
    .map((w) => w.replace(/^[^\p{L}\p{N}-]+|[^\p{L}\p{N}-]+$/gu, ""))
    .filter(Boolean);
  if (words.length < 2) return;
  const tailWords = words.slice(1).filter((w) => !ALLOWED_UPPERCASE_TOKENS.has(w));
  const capitalizedTail = tailWords.filter((w) => /^\p{Lu}\p{Ll}/u.test(w));
  expect(
    capitalizedTail.length,
    `${label} looks like Title Case ("${value}")`,
  ).toBe(0);
}

describe("TopicAnatomyExplorer and topic-anatomy-config", () => {
  it("maps the 7 relevant learning topics to valid Human Atlas sub-regions and leaves mental-wellbeing clean", () => {
    expect(Object.keys(TOPIC_ANATOMY_CONFIGS).sort()).toEqual(
      [...MAPPED_TOPICS].sort(),
    );
    expect(isTopicAnatomySlug("mental-wellbeing")).toBe(false);
    expect(getTopicAnatomyConfig("mental-wellbeing")).toBeNull();

    for (const slug of MAPPED_TOPICS) {
      const cfg = getTopicAnatomyConfig(slug);
      expect(cfg, `${slug} must have a config`).not.toBeNull();
      expect(cfg!.hotspots.length, `${slug} hotspots`).toBeGreaterThanOrEqual(3);
      expect(
        cfg!.hotspots.some((h) => h.id === cfg!.defaultHotspotId),
        `${slug} defaultHotspotId must match a hotspot`,
      ).toBe(true);
      expect(
        cfg!.availableLayers.includes(cfg!.defaultLayerMode),
        `${slug} defaultLayerMode must be in availableLayers`,
      ).toBe(true);

      for (const hotspot of cfg!.hotspots) {
        const subInfo = SUB_REGION_INFO[hotspot.subRegion];
        expect(
          subInfo,
          `${slug}.${hotspot.id} subRegion "${hotspot.subRegion}" must exist in SUB_REGION_INFO`,
        ).toBeDefined();
        expect(
          subInfo.macroPart,
          `${slug}.${hotspot.id} macroPart must match SUB_REGION_INFO`,
        ).toBe(hotspot.macroPart);
      }
    }

    // Specific topic invariants from specification
    expect(TOPIC_ANATOMY_CONFIGS["heart-health"].defaultLayerMode).toBe("organs");
    expect(TOPIC_ANATOMY_CONFIGS["heart-health"].defaultHotspotId).toBe("heart");
    expect(TOPIC_ANATOMY_CONFIGS["smoking"].defaultLayerMode).toBe("organs");
    expect(TOPIC_ANATOMY_CONFIGS["smoking"].defaultHotspotId).toBe("lungs");
    expect(TOPIC_ANATOMY_CONFIGS["physical-activity"].defaultLayerMode).toBe("skeletal");
    expect(TOPIC_ANATOMY_CONFIGS["physical-activity"].availableLayers).toContain("muscular");
    expect(TOPIC_ANATOMY_CONFIGS["healthy-eating"].defaultHotspotId).toBe("stomach_organ");
    expect(TOPIC_ANATOMY_CONFIGS["diabetes"].hotspots.map((h) => h.subRegion)).toEqual(
      expect.arrayContaining(["kidneys", "liver", "heart", "feet_soles"]),
    );
    expect(TOPIC_ANATOMY_CONFIGS["womens-health"].defaultBodyProfile).toBe("female");
    expect(TOPIC_ANATOMY_CONFIGS["womens-health"].hotspots.map((h) => h.subRegion)).toEqual(
      expect.arrayContaining(["breast", "uterus_ovaries", "bladder"]),
    );
    expect(TOPIC_ANATOMY_CONFIGS["preventive-screening"].defaultLayerMode).toBe("hybrid");
    expect(TOPIC_ANATOMY_CONFIGS["preventive-screening"].allowBodyProfileToggle).toBe(true);
  });

  it("enforces complete 7-language localization, strict sentence casing, compact buttons, zero & and zero middle dots", () => {
    for (const lang of ALL_LANGS) {
      const ui = TOPIC_ANATOMY_UI_COPY[lang];
      expect(ui, `missing UI copy for ${lang}`).toBeDefined();

      const singleLineButtons: Array<[string, string]> = [
        ["explore3d", ui.explore3d],
        ["hide3d", ui.hide3d],
        ["checkSymptomsCta", ui.checkSymptomsCta],
        ["backToGuideFocus", ui.backToGuideFocus],
      ];

      for (const [key, val] of singleLineButtons) {
        assertSentenceCaseAndCleanText(val, `ui.${lang}.${key}`);
        assertNotTitleCase(val, `ui.${lang}.${key}`);
        expect(val.length, `ui.${lang}.${key} should stay concise: "${val}"`).toBeLessThanOrEqual(28);
      }

      for (const [key, val] of Object.entries(ui)) {
        if (typeof val === "string") {
          assertSentenceCaseAndCleanText(val, `ui.${lang}.${key}`);
        } else {
          for (const [layerKey, layerVal] of Object.entries(ui.layers)) {
            assertSentenceCaseAndCleanText(layerVal, `ui.${lang}.layers.${layerKey}`);
            assertNotTitleCase(layerVal, `ui.${lang}.layers.${layerKey}`);
          }
        }
      }

      for (const slug of MAPPED_TOPICS) {
        const cfg = TOPIC_ANATOMY_CONFIGS[slug];
        assertSentenceCaseAndCleanText(cfg.heading[lang], `${slug}.heading.${lang}`);
        assertNotTitleCase(cfg.heading[lang], `${slug}.heading.${lang}`);
        assertSentenceCaseAndCleanText(cfg.intro[lang], `${slug}.intro.${lang}`);

        for (const hotspot of cfg.hotspots) {
          assertSentenceCaseAndCleanText(
            hotspot.label[lang],
            `${slug}.${hotspot.id}.label.${lang}`,
          );
          assertNotTitleCase(
            hotspot.label[lang],
            `${slug}.${hotspot.id}.label.${lang}`,
          );
          assertSentenceCaseAndCleanText(
            hotspot.fact[lang],
            `${slug}.${hotspot.id}.fact.${lang}`,
          );
          assertSentenceCaseAndCleanText(
            hotspot.whatToNotice[lang],
            `${slug}.${hotspot.id}.whatToNotice.${lang}`,
          );
        }
      }
    }
  });

  it("loads the 3D Human Atlas strictly via next/dynamic (ssr: false) with zero eager WebGL or asset imports", () => {
    const explorerSrc = readSrc(
      "src/components/health-information/TopicAnatomyExplorer.tsx",
    );

    expect(explorerSrc).toContain('import dynamic from "next/dynamic"');
    expect(explorerSrc).toContain('import("@/components/health-check/HumanAtlasPreviewStage")');
    expect(explorerSrc).toContain("ssr: false");
    expect(explorerSrc).not.toMatch(/^import\s+\{[^}]*\}\s+from\s+["']three["']/m);
    expect(explorerSrc).not.toMatch(
      /^import\s+\{[^}]*AnatomicalViewport3D/m,
    );
    expect(explorerSrc).not.toMatch(
      /^import\s+\{[^}]*HumanAtlasPreviewStage/m,
    );
    expect(explorerSrc).not.toContain("human-atlas-layers.bin");
    expect(explorerSrc).not.toContain("human-atlas-skeleton.bin");
    expect(explorerSrc).not.toContain("muscular.glb");

    // Design system guardrails
    expect(explorerSrc).not.toContain("rounded-full");
    expect(explorerSrc).not.toMatch(/\b(?:active|hover|group-hover):scale-/);
    expect(explorerSrc).not.toMatch(/\b(?:from|via|to)-(?:purple|violet|fuchsia|indigo)-/);
    expect(explorerSrc).toContain("focus-visible:ring-ring");
    expect(explorerSrc).toContain("motion-reduce:transition-none");
    expect(explorerSrc).toContain("min-h-11");
    expect(explorerSrc).toContain("min-h-12");
  });

  it("renders lightweight preview cards across all 7 topics and 7 locales with zero 3D canvas mounted on initial load", () => {
    for (const lang of ALL_LANGS) {
      // mental-wellbeing stays cleanly unmapped
      const mentalHtml = renderWithLang(
        lang,
        createElement(TopicAnatomyExplorer, { slug: "mental-wellbeing", lang }),
      );
      expect(mentalHtml).toBe("");

      for (const slug of MAPPED_TOPICS) {
        const cfg = TOPIC_ANATOMY_CONFIGS[slug];
        const ui = TOPIC_ANATOMY_UI_COPY[lang];
        const html = renderWithLang(
          lang,
          createElement(TopicAnatomyExplorer, { slug, lang }),
        );

        expect(html).toContain(`data-topic-anatomy-explorer="${slug}"`);
        expect(html).toContain('data-anatomy-3d-open="false"');
        expect(html).toContain("data-anatomy-fact-panel");
        expect(html).toContain("data-anatomy-open-3d");
        expect(html).toContain(cfg.heading[lang]);
        expect(html).toContain(ui.explore3d);
        expect(html).toContain(ui.checkSymptomsCta);
        expect(html).toContain(`href="/${lang}/health-check"`);

        // Must NOT mount 3D preview stage or canvas on initial load
        expect(html).not.toContain("data-atlas-preview-stage");
        expect(html).not.toContain("data-anatomy-3d-panel");
        expect(html).not.toContain("<canvas");

        // Zero pills, zero middle dots, zero ampersands
        expect(html).not.toContain("rounded-full");
        expect(html).not.toContain("\u00b7");
        expect(html).not.toContain("&amp;");
      }
    }
  });

  it("integrates into TopicDetailPageContent on mapped guides and omits itself on mental-wellbeing", () => {
    for (const slug of ["heart-health", "physical-activity"] as const) {
      const topic = getHealthTopicBySlug("it", slug)!;
      const html = renderWithLang(
        "it",
        createElement(TopicDetailPageContent, { topic, relatedTopics: [] }),
      );
      expect(html).toContain(`data-topic-anatomy-explorer="${slug}"`);
      expect(html).toContain('href="#section-anatomy"');
      expect(html).not.toContain("data-atlas-preview-stage");
      expect(html).not.toContain("\u00b7");
    }

    const mentalTopic = getHealthTopicBySlug("en", "mental-wellbeing")!;
    const mentalPageHtml = renderWithLang(
      "en",
      createElement(TopicDetailPageContent, {
        topic: mentalTopic,
        relatedTopics: [],
      }),
    );
    expect(mentalPageHtml).not.toContain("data-topic-anatomy-explorer");
    expect(mentalPageHtml).not.toContain('href="#section-anatomy"');
  });
});
