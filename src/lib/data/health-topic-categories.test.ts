import { describe, expect, it } from "vitest";
import { healthArticleIndex } from "./health-article-index";
import { HEALTH_TOPIC_CATEGORIES, articlesInCategory } from "./health-topic-categories";

describe("health topic categories", () => {
  it("lists every detailed article under at least one category, in every language", () => {
    const listed = new Set(HEALTH_TOPIC_CATEGORIES.flatMap((category) => articlesInCategory(category, "ro").map((article) => article.id)));
    expect([...listed].sort()).toEqual(healthArticleIndex.map((article) => article.id).sort());
    for (const category of HEALTH_TOPIC_CATEGORIES) {
      for (const lang of ["ro", "en", "sq", "it", "hr", "rom", "ru"] as const) {
        expect(category.titles[lang].trim().length, `${category.id}/${lang}`).toBeGreaterThan(0);
        expect(category.titles[lang]).not.toContain("&");
      }
    }
  });

  it("keeps the number of categories short", () => {
    expect(HEALTH_TOPIC_CATEGORIES.length).toBeLessThanOrEqual(12);
    expect(new Set(HEALTH_TOPIC_CATEGORIES.map((category) => category.id)).size).toBe(HEALTH_TOPIC_CATEGORIES.length);
  });
});
