import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import inventory from "@/content/health-articles/inventory.json";
import coverage from "@/content/health-articles/coverage.json";
import editorialStatus from "@/content/health-articles/editorial-status.json";
import directAuthorship from "@/content/health-articles/direct-authorship.json";
import { languages } from "@/lib/i18n/translations";
import { informedHealthAreas } from "./informedhealth-directory";
import { findHealthArticles, healthArticleIndex, healthArticlePath } from "./health-article-index";
import { getHealthArticle, type HealthArticleText } from "./health-articles";

describe("individual health articles", () => {
  it("accounts for every indexed topic without duplicate aliases or missing translations", () => {
    expect(inventory.failedAreas).toEqual([]);
    expect(new Set(inventory.topics.map(t => t.id)).size).toBe(inventory.topics.length);
    expect([...coverage.languages].sort()).toEqual(languages.map(l => l.code).sort());
    expect(coverage.availableTopics).toBe(healthArticleIndex.length);
    expect(coverage.completedTopics).toBe(healthArticleIndex.filter(t => t.availableLanguages.length === languages.length).length);
    expect(coverage.missing.length + coverage.completedTopics).toBe(inventory.topics.length);
    const accounted = [...healthArticleIndex.map(t => t.id), ...coverage.unavailableTopics];
    expect(new Set(accounted).size).toBe(accounted.length);
    expect(accounted.sort()).toEqual(inventory.topics.map(t => t.id).sort());
    expect(Object.keys(editorialStatus).sort()).toEqual(healthArticleIndex.map(t => t.id).sort());
    expect(healthArticleIndex.some(t => t.id === "dust-mite-allergies")).toBe(true);
    for (const item of healthArticleIndex) {
      expect(item.id).toMatch(/^[a-z0-9-]+$/);
      expect(item.sourceUrl).toBe(`https://www.informedhealth.org/${item.id}.html`);
      expect(item.areaIds.length).toBeGreaterThan(0);
      expect(item.areaIds.every(id => informedHealthAreas.some(area => area.id === id))).toBe(true);
      for (const { code } of languages) expect(item.titles[code].length).toBeGreaterThan(3);
    }
  });

  it.each(languages.filter(l => coverage.languages.includes(l.code)))("has substantial, structured $code articles with examples and consultation questions", async ({ code }) => {
    expect(coverage.availableByLanguage[code]).toBe(healthArticleIndex.filter(t => t.availableLanguages.includes(code)).length);
    expect(coverage.missingByLanguage[code].length + coverage.availableByLanguage[code]).toBe(inventory.topics.length);
    for (const topic of healthArticleIndex.filter(t => t.availableLanguages.includes(code))) {
      const root = new URL("../../content/health-articles/", import.meta.url);
      const raw = await readFile(new URL(`${code}/${topic.id}.json`, root), "utf8");
      const article = JSON.parse(raw) as HealthArticleText;
      const status = (editorialStatus as Record<string, { contentHashes: Record<string, string>; humanClinicalReview: boolean }>)[topic.id];
      expect(createHash("sha256").update(raw).digest("hex")).toBe(status.contentHashes[code]);
      expect(status.humanClinicalReview).toBe(false);
      const en = JSON.parse(await readFile(new URL(`en/${topic.id}.json`, root), "utf8")) as HealthArticleText;
      expect(article.sections.length, `${code}/${topic.id}`).toBeGreaterThanOrEqual(4);
      expect(article.sections.map(s => s.paragraphs.length)).toEqual(en.sections.map(s => s.paragraphs.length));
      expect(article.examples).toHaveLength(2);
      expect(article.questions).toHaveLength(3);
      expect(article.intro.length).toBeGreaterThan(80);
      expect(article.sections.every(s => s.heading.length > 3 && s.paragraphs.every(p => p.trim().length > 25))).toBe(true);
      expect(JSON.stringify(article).length).toBeGreaterThan(1800);
      expect(JSON.stringify(article)).not.toMatch(/<\/?(?:script|iframe)|https?:\/\//);
      if (code !== "en") expect(article.intro).not.toBe(en.intro);
      const numbers = (value: unknown) => (JSON.stringify(value).match(/\d+(?:[.,]\d+)?/g) ?? []).map(n => n.replace(",", ".")).sort();
      expect(numbers(article)).toEqual(numbers(en));
    }
  });

  it("supports local article discovery and category filtering", () => {
    expect(findHealthArticles("en", "dust mite").some(t => t.id === "dust-mite-allergies")).toBe(true);
    expect(findHealthArticles("ro", "acarieni").some(t => t.id === "dust-mite-allergies")).toBe(true);
    expect(findHealthArticles("ru", "", "allergies").every(t => t.areaIds.includes("allergies"))).toBe(true);
    expect(findHealthArticles("en", "no-such-topic-xyz")).toEqual([]);
    expect(healthArticlePath("dust-mite-allergies")).toBe("/health-information/articles/dust-mite-allergies");
  });

  it("records direct authorship without claiming provider-assisted checks", () => {
    for (const id of Object.keys(directAuthorship)) {
      const status = (editorialStatus as Record<string, { authoringMethod: string; automatedSourceCheck: boolean; automatedTranslationCheck: boolean }>)[id];
      expect(status.authoringMethod).toBe("direct-assistant");
      expect(status.automatedSourceCheck).toBe(false);
      expect(status.automatedTranslationCheck).toBe(false);
    }
  });

  it("rejects unknown ids before attempting a dynamic import", async () => {
    for (const id of ["__proto__", "constructor", "../../inventory", "no-such-topic"]) expect(await getHealthArticle("ro", id)).toBeUndefined();
    for (const id of coverage.unavailableTopics) expect(await getHealthArticle("ro", id)).toBeUndefined();
  });
});
