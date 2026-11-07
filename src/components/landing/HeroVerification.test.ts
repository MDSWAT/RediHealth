import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";

// Mock language context to test across all 4 languages
let currentLang = "ro";

vi.mock("@/lib/i18n/language-context", async () => {
  const { translations } = await import("@/lib/i18n/translations");
  return {
    useLanguage: () => ({
      lang: currentLang,
      t: translations[currentLang as keyof typeof translations],
      setLang: vi.fn(),
    }),
  };
});

import { Hero } from "./Hero";
import { translations, type Lang } from "@/lib/i18n/translations";

const langs: Lang[] = ["ro", "en", "sq", "it"];

describe("Empirical Challenger 2 Audit: Copywriting & Formatting Law", () => {
  it("verifies 0 bare ampersands (&) in hero translations across ro, en, sq, it", () => {
    const ampersandViolations: { lang: string; path: string; text: string }[] = [];

    function scanForAmpersands(obj: unknown, pathStr: string, lang: string) {
      if (typeof obj === "string") {
        if (/[^\w]&[^\w]|^\s*&\s*|\s&\s/.test(obj) || (obj.includes("&") && !obj.includes("&quot;") && !obj.includes("&amp;") && !obj.includes("&#"))) {
          ampersandViolations.push({ lang, path: pathStr, text: obj });
        }
      } else if (Array.isArray(obj)) {
        obj.forEach((item, idx) => scanForAmpersands(item, `${pathStr}[${idx}]`, lang));
      } else if (typeof obj === "object" && obj !== null) {
        const record = obj as Record<string, unknown>;
        for (const key of Object.keys(record)) {
          scanForAmpersands(record[key], `${pathStr}.${key}`, lang);
        }
      }
    }

    langs.forEach((lang) => {
      scanForAmpersands(translations[lang].hero, "hero", lang);
    });

    expect(ampersandViolations).toEqual([]);
  });

  it("verifies 0 bare ampersands (&) in rendered HTML across all 4 languages", () => {
    langs.forEach((lang) => {
      currentLang = lang;
      const heroHtml = renderToStaticMarkup(createElement(Hero, { showAssistantCta: true }));
      // Bare & is not part of entity
      expect(heroHtml).not.toMatch(/(?<!&[a-zA-Z0-9#]+)\s&\s/);
      expect(heroHtml).not.toMatch(/>\s*&\s*</);
    });
  });

  it("verifies strict sentence casing across hero translations", () => {
    const allowedAcronyms = new Set(["REDI", "CNAS", "FAST", "UPU", "112", "SMS", "CTA", "ID", "UI", "UX"]);
    const violations: { lang: string; field: string; text: string; words: string[] }[] = [];

    langs.forEach((lang) => {
      const h = translations[lang].hero;
      const targets = [
        { field: "trustBadge", text: h.trustBadge },
        { field: "titleLine1", text: h.titleLine1 },
        { field: "titleLine2", text: h.titleLine2 },
        { field: "titleLine3", text: h.titleLine3 },
        { field: "cta", text: h.cta },
        { field: "assistantCta", text: h.assistantCta },
        { field: "mediatorPill", text: h.mediatorPill },
        { field: "telemedicinePill", text: h.telemedicinePill },
        { field: "emergencyNoticeVerbatim", text: h.emergencyNoticeVerbatim },
        { field: "triage.badge", text: h.triage.badge },
        { field: "triage.question", text: h.triage.question },
        { field: "triage.subQuestion", text: h.triage.subQuestion },
        { field: "triage.doctorPrompt", text: h.triage.doctorPrompt },
        { field: "triage.doctorScheduleCta", text: h.triage.doctorScheduleCta },
        { field: "triage.doctorOnDutyCta", text: h.triage.doctorOnDutyCta },
        { field: "triage.backButton", text: h.triage.backButton },
        { field: "triage.reassurance", text: h.triage.reassurance },
      ];

      h.triage.options.forEach((opt, idx) => {
        targets.push({ field: `triage.options[${idx}].title`, text: opt.title });
        targets.push({ field: `triage.options[${idx}].actionLabel`, text: opt.actionLabel });
      });

      targets.forEach(({ field, text }) => {
        // Break into segments by punctuation (e.g. " · " or " — ")
        const segments = text.split(/[·—–:]/).map((s) => s.trim()).filter(Boolean);
        segments.forEach((seg) => {
          const words = seg
            .replace(/^[«"'({\[]+/, "")
            .replace(/[»"')}\]]+$/, "")
            .split(/\s+/)
            .map((w) => w.replace(/[^\p{L}\p{N}-]/gu, ""))
            .filter((w) => w.length > 0);

          if (words.length <= 1) return;

          // Check for ALL CAPS
          const isAllUpper = words.every((w) => w === w.toUpperCase() && !allowedAcronyms.has(w));
          if (isAllUpper) {
            violations.push({ lang, field, text, words });
            return;
          }

          // Check for Title Case (multiple non-first capitalized words)
          const nonFirstCapped = words.slice(1).filter((w) => {
            const firstChar = w[0];
            return firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase() && !allowedAcronyms.has(w) && !["Roma", "Rom", "Rome"].includes(w);
          });

          if (nonFirstCapped.length >= 2 || (words.length >= 3 && nonFirstCapped.length / words.length > 0.4)) {
            violations.push({ lang, field, text, words: nonFirstCapped });
          }
        });
      });
    });

    // In a strict pass, there should be zero violations
    expect(violations).toEqual([]);
  });

  it("checks for CSS 'uppercase' class on prose text in Hero.tsx", () => {
    const heroFilePath = path.resolve("src/components/landing/Hero.tsx");
    const content = fs.readFileSync(heroFilePath, "utf-8");
    // Flag if 'uppercase' class is used
    const hasUppercase = content.includes("uppercase");
    // We expect NO uppercase classes according to the law:
    // "NEVER use uppercase / ALL CAPS (even for badges, tags, or eyebrows)"
    expect(hasUppercase).toBe(false);
  });
});

describe("Empirical Challenger 2 Audit: Color Tokens and Green Quarantine", () => {
  it("verifies Obsidian Navy, Clinical Ruby, Deep Sapphire, Warm Alabaster, and Amber Gold tokens in globals.css", () => {
    const globalsCss = fs.readFileSync(path.resolve("src/app/globals.css"), "utf-8");

    // Obsidian Navy (#0B132B)
    expect(globalsCss).toMatch(/--color-obsidian-navy:\s*#0b132b/i);
    // Clinical Ruby (#E63946)
    expect(globalsCss).toMatch(/--color-primary:\s*#e63946/i);
    // Deep Sapphire (#1D3557)
    expect(globalsCss).toMatch(/--color-sapphire:\s*#1d3557/i);
    // Warm Alabaster (#FCFBF9 or #F8F9FA)
    expect(globalsCss).toMatch(/--color-background:\s*#fcfbf9/i);
    // Amber Gold (#D97706)
    expect(globalsCss).toMatch(/--color-amber-care:\s*#d97706/i);
  });

  it("verifies green is strictly restricted to micro status indicators", () => {
    const files = [
      "src/components/landing/Hero.tsx",
      "src/components/landing/HeroEmergencyNotice.tsx",
      "src/components/landing/HeroDecisionTree.tsx",
      "src/components/landing/HeroPortals.tsx",
    ];

    files.forEach((file) => {
      const content = fs.readFileSync(path.resolve(file), "utf-8");
      // Check for green background or text classes: e.g. bg-green-500, bg-emerald-600
      const largeGreenMatches = content.match(/\b(?:bg|border)-(?:green|emerald|teal)-(?:400|500|600|700)\b/g);
      expect(largeGreenMatches).toBeNull();
    });
  });
});
