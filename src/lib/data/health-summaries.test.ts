import { describe, expect, it } from "vitest";
import { languages } from "@/lib/i18n/translations";
import { getHealthSummary, getRelatedHealthSummaries } from "./health-summaries";
import { healthSummaryPath, informedHealthAreas, informedHealthSourceUrl } from "./informedhealth-directory";

describe("local health topic summaries", () => {
  it.each(languages)("provides original summary text for all 51 topics in $code", ({ code }) => {
    for (const area of informedHealthAreas) {
      const summary = getHealthSummary(code, area.id);
      expect(summary, `${code}/${area.id}`).toBeDefined();
      expect(summary!.title).toBe(area.titles[code]);
      expect(summary!.intro.length).toBeGreaterThan(40);
      expect(summary!.details.length).toBeGreaterThan(40);
      expect(summary!.questions).toHaveLength(2);
      expect(summary!.questions.every(question => question.trim().length > 10)).toBe(true);
      expect(summary!.sourceUrl).toBe(informedHealthSourceUrl(area.id));
      if (summary!.contentLanguage !== "en") {
        expect(summary!.intro).not.toBe(getHealthSummary("en", area.id)!.intro);
        expect(summary!.details).not.toBe(getHealthSummary("en", area.id)!.details);
      }
      const numbers = (text: string) => [...text.matchAll(/\d+/g)].map(match => match[0]).sort();
      const source = getHealthSummary("en", area.id)!;
      expect(numbers([summary!.intro, summary!.details, ...summary!.questions].join(" ")))
        .toEqual(numbers([source.intro, source.details, ...source.questions].join(" ")));
    }
  });

  it("uses local paths and rejects unknown or inherited keys", () => {
    for (const area of informedHealthAreas) expect(healthSummaryPath(area.id)).toBe(`/health-information/topics/${area.id}`);
    for (const id of ["not-a-topic", "__proto__", "constructor"]) expect(getHealthSummary("ro", id)).toBeUndefined();
    expect(getHealthSummary("ro", "second-opinions-before-surgery")!.sourceUrl).toBe("https://www.informedhealth.org/before-surgery-getting-information-and-making-a-decision.html");
  });

  it("suggests other summaries from a shared topic group without repeating the current page", () => {
    for (const area of informedHealthAreas) {
      const suggestions = getRelatedHealthSummaries("ro", area.id);
      expect(suggestions.length).toBeLessThanOrEqual(3);
      for (const item of suggestions) {
        expect(item.id).not.toBe(area.id);
        expect(informedHealthAreas.find(other => other.id === item.id)?.groups.some(group => area.groups.includes(group))).toBe(true);
      }
    }
  });
});
